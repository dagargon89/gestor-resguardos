<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Models\AsignacionModel;
use App\Models\BienModel;
use App\Services\FolioService;
use App\Services\AuditoriaService;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class Asignaciones extends BaseController
{
    use ResponseTrait;

    private AsignacionModel  $model;
    private BienModel        $bienes;
    private FolioService     $folios;
    private AuditoriaService $auditoria;

    public function __construct()
    {
        $this->model     = model(AsignacionModel::class);
        $this->bienes    = model(BienModel::class);
        $this->folios    = new FolioService();
        $this->auditoria = new AuditoriaService();
    }

    public function index(): ResponseInterface
    {
        $page    = (int) ($this->request->getGet('page') ?? 1);
        $perPage = min((int) ($this->request->getGet('per_page') ?? 50), 200);
        $tipo    = $this->request->getGet('tipo');
        $estado  = $this->request->getGet('estado');
        $empId   = $this->request->getGet('empleado_id');
        $orgId   = $this->request->getGet('organizacion_id');
        $q       = $this->request->getGet('q');

        $m = $this->model->conRelaciones();

        if ($tipo)   $m->where('asignaciones.tipo', $tipo);
        if ($estado) $m->where('asignaciones.estado', $estado);
        if ($empId)  $m->where('asignaciones.empleado_responsable_id', $empId);
        if ($orgId)  $m->where('emp.organizacion_id', $orgId);
        if ($q) {
            $m->groupStart()
              ->like('asignaciones.folio', $q)
              ->orLike('emp.nombre',       $q)
              ->orLike('emp.apellido_paterno', $q)
              ->groupEnd();
        }

        $total = $m->countAllResults(false);
        $rows  = $m->orderBy('asignaciones.created_at', 'DESC')
                   ->limit($perPage, ($page - 1) * $perPage)
                   ->findAll();

        // Añadir bienes a cada fila
        foreach ($rows as &$row) {
            $row['bienes'] = $this->model->bienesDeAsignacion($row['id']);
        }

        return $this->respond([
            'data' => $rows,
            'meta' => [
                'page'        => $page,
                'per_page'    => $perPage,
                'total'       => $total,
                'total_pages' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    public function show(int $id): ResponseInterface
    {
        $row = $this->model->conRelaciones()->find($id);
        if (! $row) return $this->failNotFound('Asignación no encontrada');

        $row['bienes'] = $this->model->bienesDeAsignacion($id);

        return $this->respond(['data' => $row]);
    }

    public function create(): ResponseInterface
    {
        $data    = $this->request->getJSON(true);
        $bienesIds = $data['bienes'] ?? [];
        unset($data['bienes']);

        if (! $this->model->validate($data)) {
            return $this->failValidationErrors($this->model->errors());
        }

        if (empty($bienesIds)) {
            return $this->failValidationErrors(['bienes' => 'Debe incluir al menos un bien']);
        }

        // Verificar que no haya bienes activos en otra asignación
        foreach ($bienesIds as $bienItem) {
            $bienId  = is_array($bienItem) ? $bienItem['bien_id'] : $bienItem;
            $activas = $this->model->db->table('asignacion_bienes ab')
                ->join('asignaciones a', 'a.id = ab.asignacion_id')
                ->where('ab.bien_id', $bienId)
                ->whereIn('a.estado', ['activa', 'borrador'])
                ->countAllResults();

            if ($activas > 0) {
                $bien = $this->bienes->find($bienId);
                return $this->failConflict("El bien '{$bien['codigo_interno']}' ya tiene una asignación activa");
            }
        }

        db_connect()->transStart();

        $data['folio']      = $this->folios->generarFolio($data['tipo']);
        $data['creado_por'] = auth()->id();
        $id = $this->model->insert($data);

        // Insertar líneas
        foreach ($bienesIds as $bienItem) {
            $bienId   = is_array($bienItem) ? $bienItem['bien_id']  : $bienItem;
            $cantidad = is_array($bienItem) ? ($bienItem['cantidad'] ?? 1) : 1;
            $notas    = is_array($bienItem) ? ($bienItem['notas'] ?? null) : null;

            db_connect()->table('asignacion_bienes')->insert([
                'asignacion_id' => $id,
                'bien_id'       => $bienId,
                'cantidad'      => $cantidad,
                'notas'         => $notas,
                'created_at'    => date('Y-m-d H:i:s'),
            ]);

            // Actualizar estado del bien a 'Asignado' (id=2) o 'En préstamo' (id=6)
            $estadoId = $data['tipo'] === 'prestamo' ? 6 : 2;
            $this->bienes->update($bienId, ['estado_bien_id' => $estadoId]);
        }

        // Evento inicial
        db_connect()->table('asignacion_eventos')->insert([
            'asignacion_id' => $id,
            'tipo'          => 'creacion',
            'descripcion'   => "Asignación creada con folio {$data['folio']}",
            'usuario_id'    => auth()->id(),
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        db_connect()->transComplete();

        if (! db_connect()->transStatus()) {
            return $this->failServerError('Error al crear la asignación');
        }

        $this->auditoria->registrar('asignaciones', $id, 'insert', null, $data, auth()->id());

        $row = $this->model->conRelaciones()->find($id);
        $row['bienes'] = $this->model->bienesDeAsignacion($id);

        return $this->respondCreated(['data' => $row]);
    }

    public function update(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Asignación no encontrada');

        if (in_array($row['estado'], ['devuelta', 'cancelada'], true)) {
            return $this->failForbidden('No se puede modificar una asignación devuelta o cancelada');
        }

        $data = $this->request->getJSON(true);
        unset($data['folio'], $data['bienes']);

        $this->model->update($id, $data);
        $this->auditoria->registrar('asignaciones', $id, 'update', $row, $data, auth()->id());

        $row = $this->model->conRelaciones()->find($id);
        $row['bienes'] = $this->model->bienesDeAsignacion($id);

        return $this->respond(['data' => $row]);
    }

    public function delete(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Asignación no encontrada');

        if ($row['estado'] === 'activa') {
            return $this->failForbidden('No se puede eliminar una asignación activa. Use cancelar.');
        }

        $this->model->delete($id);
        return $this->respondDeleted(['data' => ['message' => 'Asignación eliminada']]);
    }

    public function devolver(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Asignación no encontrada');

        if ($row['estado'] !== 'activa') {
            return $this->failForbidden('Solo se pueden devolver asignaciones activas');
        }

        $data = $this->request->getJSON(true);

        db_connect()->transStart();

        $this->model->update($id, [
            'estado'   => 'devuelta',
            'fin_real' => $data['fecha_devolucion'] ?? date('Y-m-d'),
        ]);

        // Liberar bienes (estado disponible = 1)
        $bienes = $this->model->bienesDeAsignacion($id);
        foreach ($bienes as $b) {
            $this->bienes->update($b['bien_id'], ['estado_bien_id' => 1]);
        }

        db_connect()->table('asignacion_eventos')->insert([
            'asignacion_id' => $id,
            'tipo'          => 'devolucion',
            'descripcion'   => $data['observaciones'] ?? 'Devolución registrada',
            'usuario_id'    => auth()->id(),
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        db_connect()->transComplete();
        $this->auditoria->registrar('asignaciones', $id, 'update', $row, ['estado' => 'devuelta'], auth()->id());

        return $this->respond(['data' => ['message' => 'Devolución registrada']]);
    }

    public function transferir(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Asignación no encontrada');

        if ($row['estado'] !== 'activa') {
            return $this->failForbidden('Solo se pueden transferir asignaciones activas');
        }

        $data            = $this->request->getJSON(true);
        $nuevoEmpleadoId = $data['nuevo_empleado_id'] ?? null;

        if (! $nuevoEmpleadoId) {
            return $this->failValidationErrors(['nuevo_empleado_id' => 'Requerido']);
        }

        db_connect()->transStart();

        // Cerrar asignación actual
        $this->model->update($id, ['estado' => 'transferida', 'fin_real' => date('Y-m-d')]);

        // Nueva asignación con el nuevo responsable
        $nuevoFolio = $this->folios->generarFolio($row['tipo']);
        $nuevoId = $this->model->insert([
            'folio'                   => $nuevoFolio,
            'tipo'                    => $row['tipo'],
            'estado'                  => 'activa',
            'empleado_responsable_id' => $nuevoEmpleadoId,
            'inicio'                  => date('Y-m-d'),
            'condiciones'             => $row['condiciones'],
            'creado_por'              => auth()->id(),
        ]);

        // Transferir líneas de bienes
        $bienes = $this->model->bienesDeAsignacion($id);
        foreach ($bienes as $b) {
            db_connect()->table('asignacion_bienes')->insert([
                'asignacion_id' => $nuevoId,
                'bien_id'       => $b['bien_id'],
                'cantidad'      => $b['cantidad'],
                'created_at'    => date('Y-m-d H:i:s'),
            ]);
        }

        db_connect()->table('asignacion_eventos')->insert([
            'asignacion_id' => $id,
            'tipo'          => 'transferencia',
            'descripcion'   => "Transferida a empleado #{$nuevoEmpleadoId}. Nueva asignación: {$nuevoFolio}",
            'payload_json'  => json_encode(['nuevo_folio' => $nuevoFolio, 'nuevo_empleado_id' => $nuevoEmpleadoId]),
            'usuario_id'    => auth()->id(),
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        db_connect()->transComplete();

        return $this->respond(['data' => ['message' => 'Transferencia completada', 'nuevo_folio' => $nuevoFolio]]);
    }

    public function cancelar(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Asignación no encontrada');

        if (in_array($row['estado'], ['devuelta', 'cancelada'], true)) {
            return $this->failForbidden('Asignación ya cerrada');
        }

        $data = $this->request->getJSON(true);

        $this->model->update($id, ['estado' => 'cancelada', 'fin_real' => date('Y-m-d')]);

        // Liberar bienes
        $bienes = $this->model->bienesDeAsignacion($id);
        foreach ($bienes as $b) {
            $this->bienes->update($b['bien_id'], ['estado_bien_id' => 1]);
        }

        db_connect()->table('asignacion_eventos')->insert([
            'asignacion_id' => $id,
            'tipo'          => 'cancelacion',
            'descripcion'   => $data['motivo'] ?? 'Cancelación registrada',
            'usuario_id'    => auth()->id(),
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        return $this->respond(['data' => ['message' => 'Asignación cancelada']]);
    }

    public function eventos(int $id): ResponseInterface
    {
        if (! $this->model->find($id)) return $this->failNotFound('Asignación no encontrada');

        $eventos = db_connect()->table('asignacion_eventos ae')
            ->select(['ae.*', 'u.username AS usuario'])
            ->join('users u', 'u.id = ae.usuario_id', 'left')
            ->where('ae.asignacion_id', $id)
            ->orderBy('ae.created_at', 'DESC')
            ->get()->getResultArray();

        return $this->respond(['data' => $eventos]);
    }

    public function documentos(int $id): ResponseInterface
    {
        if (! $this->model->find($id)) return $this->failNotFound('Asignación no encontrada');

        $docs = db_connect()->table('documentos_generados')->where('asignacion_id', $id)->orderBy('generado_en', 'DESC')->get()->getResultArray();
        return $this->respond(['data' => $docs]);
    }
}
