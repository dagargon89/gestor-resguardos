<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Models\BienModel;
use App\Models\MovimientoPatrimonialModel;
use App\Services\AuditoriaService;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class Bienes extends BaseController
{
    use ResponseTrait;

    private BienModel                  $model;
    private MovimientoPatrimonialModel $movimientos;
    private AuditoriaService           $auditoria;

    public function __construct()
    {
        $this->model       = model(BienModel::class);
        $this->movimientos = model(MovimientoPatrimonialModel::class);
        $this->auditoria   = new AuditoriaService();
    }

    public function index(): ResponseInterface
    {
        $page    = (int) ($this->request->getGet('page') ?? 1);
        $perPage = min((int) ($this->request->getGet('per_page') ?? 50), 200);
        $filtros = [
            'organizacion_id' => $this->request->getGet('organizacion_id'),
            'categoria_id'    => $this->request->getGet('categoria_id'),
            'estado_bien_id'  => $this->request->getGet('estado_bien_id'),
            'activo'          => $this->request->getGet('activo'),
            'q'               => $this->request->getGet('q'),
        ];

        $result = $this->model->listadoConRelaciones($filtros, $page, $perPage);

        return $this->respond([
            'data' => $result['rows'],
            'meta' => [
                'page'        => $page,
                'per_page'    => $perPage,
                'total'       => $result['total'],
                'total_pages' => (int) ceil($result['total'] / $perPage),
                'filtros'     => $filtros,
            ],
        ]);
    }

    public function show(int $id): ResponseInterface
    {
        $row = $this->model->select([
            'bienes.*',
            'org.nombre AS organizacion', 'cat.nombre AS categoria',
            'est.nombre AS estado',       'ubi.nombre AS ubicacion',
            'prov.nombre AS proveedor',
        ])
        ->join('organizaciones org', 'org.id = bienes.organizacion_id', 'left')
        ->join('categorias_bien cat','cat.id = bienes.categoria_id',    'left')
        ->join('estados_bien est',  'est.id = bienes.estado_bien_id',   'left')
        ->join('ubicaciones ubi',   'ubi.id = bienes.ubicacion_id',     'left')
        ->join('proveedores prov',  'prov.id = bienes.proveedor_id',    'left')
        ->find($id);

        if (! $row) return $this->failNotFound('Bien no encontrado');

        return $this->respond(['data' => $row]);
    }

    public function create(): ResponseInterface
    {
        $data = $this->request->getJSON(true);
        if (! $this->model->validate($data)) {
            return $this->failValidationErrors($this->model->errors());
        }

        // Verificar unicidad de codigo_interno
        if (! empty($data['codigo_interno']) && $this->model->where('codigo_interno', $data['codigo_interno'])->countAllResults() > 0) {
            return $this->failValidationErrors(['codigo_interno' => 'El código ya existe']);
        }

        $id = $this->model->insert($data);
        $this->movimientos->insert([
            'bien_id'    => $id,
            'tipo'       => 'alta',
            'motivo'     => 'Alta inicial del bien',
            'usuario_id' => auth()->id(),
            'ip'         => $this->request->getIPAddress(),
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        $this->auditoria->registrar('bienes', $id, 'insert', null, $data, auth()->id());

        return $this->respondCreated(['data' => $this->model->find($id)]);
    }

    public function update(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Bien no encontrado');

        $data = $this->request->getJSON(true);

        // Detectar cambio de estado para bitácora patrimonial
        if (isset($data['estado_bien_id']) && $data['estado_bien_id'] != $row['estado_bien_id']) {
            $this->movimientos->insert([
                'bien_id'         => $id,
                'tipo'            => 'ajuste',
                'campo_afectado'  => 'estado_bien_id',
                'valor_anterior'  => $row['estado_bien_id'],
                'valor_nuevo'     => $data['estado_bien_id'],
                'motivo'          => $data['motivo'] ?? 'Cambio de estado',
                'usuario_id'      => auth()->id(),
                'ip'              => $this->request->getIPAddress(),
                'created_at'      => date('Y-m-d H:i:s'),
            ]);
        }

        $this->model->update($id, $data);
        $this->auditoria->registrar('bienes', $id, 'update', $row, $data, auth()->id());

        return $this->respond(['data' => $this->model->find($id)]);
    }

    public function delete(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Bien no encontrado');

        $this->model->delete($id);
        $this->movimientos->insert([
            'bien_id'    => $id,
            'tipo'       => 'baja',
            'motivo'     => $this->request->getJSON(true)['motivo'] ?? 'Baja del bien',
            'usuario_id' => auth()->id(),
            'ip'         => $this->request->getIPAddress(),
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        $this->auditoria->registrar('bienes', $id, 'delete', $row, null, auth()->id());

        return $this->respondDeleted(['data' => ['message' => 'Bien dado de baja']]);
    }

    public function movimientos(int $id): ResponseInterface
    {
        if (! $this->model->find($id)) return $this->failNotFound('Bien no encontrado');

        $rows = $this->movimientos->where('bien_id', $id)->orderBy('created_at', 'DESC')->findAll();
        return $this->respond(['data' => $rows]);
    }

    public function adjuntos(int $id): ResponseInterface
    {
        if (! $this->model->find($id)) return $this->failNotFound('Bien no encontrado');

        $rows = db_connect()->table('bien_adjuntos')->where('bien_id', $id)->orderBy('created_at', 'DESC')->get()->getResultArray();
        return $this->respond(['data' => $rows]);
    }

    public function subirAdjunto(int $id): ResponseInterface
    {
        if (! $this->model->find($id)) return $this->failNotFound('Bien no encontrado');

        $file = $this->request->getFile('archivo');
        if (! $file || ! $file->isValid()) {
            return $this->failValidationErrors(['archivo' => 'Archivo inválido o no enviado']);
        }

        $newName = $file->getRandomName();
        $ruta    = 'uploads/bienes/' . $id . '/';
        $file->move(FCPATH . $ruta, $newName);

        $hash = hash_file('sha256', FCPATH . $ruta . $newName);

        db_connect()->table('bien_adjuntos')->insert([
            'bien_id'     => $id,
            'tipo'        => $file->getMimeType(),
            'nombre'      => $file->getClientName(),
            'ruta'        => $ruta . $newName,
            'hash_sha256' => $hash,
            'tamano'      => $file->getSizeByUnit('b'),
            'mime_type'   => $file->getMimeType(),
            'subido_por'  => auth()->id(),
            'created_at'  => date('Y-m-d H:i:s'),
        ]);

        return $this->respondCreated(['data' => ['mensaje' => 'Archivo subido correctamente', 'ruta' => $ruta . $newName]]);
    }
}
