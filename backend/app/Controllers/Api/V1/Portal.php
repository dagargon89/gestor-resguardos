<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Models\AsignacionModel;
use App\Services\CartaService;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Portal para empleados.
 *
 * SEGURIDAD: Todo endpoint resuelve el empleado_id desde el TOKEN (no desde la URL),
 * eliminando el riesgo de IDOR. El empleado solo ve sus propios datos.
 */
class Portal extends BaseController
{
    use ResponseTrait;

    private AsignacionModel $model;
    private CartaService    $cartaService;

    public function __construct()
    {
        $this->model        = model(AsignacionModel::class);
        $this->cartaService = new CartaService();
    }

    // Resuelve el empleado_id del usuario autenticado. Retorna null si no tiene vinculación.
    private function empleadoId(): ?int
    {
        $user = auth('tokens')->user();
        if ($user === null) return null;

        $row = db_connect()->table('users')->select('empleado_id')->find($user->id);
        return $row ? ((int) $row['empleado_id'] ?: null) : null;
    }

    public function perfil(): ResponseInterface
    {
        $empleadoId = $this->empleadoId();
        if (! $empleadoId) return $this->failForbidden('Tu cuenta no está vinculada a un empleado');

        $empleado = db_connect()->table('empleados e')
            ->select('e.*, dep.nombre AS departamento, org.nombre AS organizacion')
            ->join('departamentos dep', 'dep.id = e.departamento_id', 'left')
            ->join('organizaciones org','org.id = e.organizacion_id',  'left')
            ->where('e.id', $empleadoId)
            ->get()->getRowArray();

        if (! $empleado) return $this->failNotFound('Empleado no encontrado');

        return $this->respond(['data' => $empleado]);
    }

    public function misAsignaciones(): ResponseInterface
    {
        $empleadoId = $this->empleadoId();
        if (! $empleadoId) return $this->failForbidden('Tu cuenta no está vinculada a un empleado');

        $estado = $this->request->getGet('estado');
        $tipo   = $this->request->getGet('tipo');

        $m = $this->model->conRelaciones()
            ->where('asignaciones.empleado_responsable_id', $empleadoId);

        if ($estado) $m->where('asignaciones.estado', $estado);
        if ($tipo)   $m->where('asignaciones.tipo', $tipo);

        $rows = $m->orderBy('asignaciones.created_at', 'DESC')->findAll();

        foreach ($rows as &$row) {
            $row['bienes'] = $this->model->bienesDeAsignacion($row['id']);
        }

        return $this->respond(['data' => $rows]);
    }

    public function detalleAsignacion(int $id): ResponseInterface
    {
        $empleadoId = $this->empleadoId();
        if (! $empleadoId) return $this->failForbidden('Tu cuenta no está vinculada a un empleado');

        $row = $this->model->conRelaciones()
            ->where('asignaciones.empleado_responsable_id', $empleadoId) // IDOR: forzar propiedad
            ->find($id);

        if (! $row) return $this->failNotFound('Asignación no encontrada o no te pertenece');

        $row['bienes'] = $this->model->bienesDeAsignacion($id);

        return $this->respond(['data' => $row]);
    }

    public function misDocumentos(): ResponseInterface
    {
        $empleadoId = $this->empleadoId();
        if (! $empleadoId) return $this->failForbidden('Tu cuenta no está vinculada a un empleado');

        $docs = db_connect()->table('documentos_generados dg')
            ->select('dg.*, a.folio, a.tipo')
            ->join('asignaciones a', 'a.id = dg.asignacion_id')
            ->where('a.empleado_responsable_id', $empleadoId) // Solo documentos propios
            ->orderBy('dg.generado_en', 'DESC')
            ->get()->getResultArray();

        return $this->respond(['data' => $docs]);
    }

    public function descargar(int $docId): ResponseInterface
    {
        $empleadoId = $this->empleadoId();
        if (! $empleadoId) return $this->failForbidden('Tu cuenta no está vinculada a un empleado');

        // Verificar que el documento pertenezca al empleado (anti-IDOR)
        $doc = db_connect()->table('documentos_generados dg')
            ->select('dg.*')
            ->join('asignaciones a', 'a.id = dg.asignacion_id')
            ->where('dg.id', $docId)
            ->where('a.empleado_responsable_id', $empleadoId)
            ->get()->getRowArray();

        if (! $doc) return $this->failNotFound('Documento no encontrado o acceso denegado');

        $path = FCPATH . $doc['ruta'];
        if (! file_exists($path)) return $this->failNotFound('Archivo no disponible');

        return $this->response
            ->setHeader('Content-Disposition', 'attachment; filename="' . basename($path) . '"')
            ->setContentType('text/html')
            ->setBody(file_get_contents($path));
    }
}
