<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Models\EmpleadoModel;
use App\Models\AsignacionModel;
use App\Services\AuditoriaService;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class Empleados extends BaseController
{
    use ResponseTrait;

    private EmpleadoModel    $model;
    private AuditoriaService $auditoria;

    public function __construct()
    {
        $this->model     = model(EmpleadoModel::class);
        $this->auditoria = new AuditoriaService();
    }

    public function index(): ResponseInterface
    {
        $page    = (int) ($this->request->getGet('page') ?? 1);
        $perPage = min((int) ($this->request->getGet('per_page') ?? 50), 200);
        $filtros = [
            'organizacion_id' => $this->request->getGet('organizacion_id'),
            'departamento_id' => $this->request->getGet('departamento_id'),
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
            ],
        ]);
    }

    public function show(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Empleado no encontrado');
        return $this->respond(['data' => $row]);
    }

    public function create(): ResponseInterface
    {
        $data = $this->request->getJSON(true);
        if (! $this->model->validate($data)) {
            return $this->failValidationErrors($this->model->errors());
        }
        $id = $this->model->insert($data);
        $this->auditoria->registrar('empleados', $id, 'insert', null, $data, auth()->id());
        return $this->respondCreated(['data' => $this->model->find($id)]);
    }

    public function update(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Empleado no encontrado');
        $data = $this->request->getJSON(true);
        $this->model->update($id, $data);
        $this->auditoria->registrar('empleados', $id, 'update', $row, $data, auth()->id());
        return $this->respond(['data' => $this->model->find($id)]);
    }

    public function delete(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Empleado no encontrado');
        $this->model->delete($id);
        $this->auditoria->registrar('empleados', $id, 'delete', $row, null, auth()->id());
        return $this->respondDeleted(['data' => ['message' => 'Eliminado']]);
    }

    public function asignaciones(int $id): ResponseInterface
    {
        if (! $this->model->find($id)) return $this->failNotFound('Empleado no encontrado');

        $asignaciones = model(AsignacionModel::class)
            ->conRelaciones()
            ->where('asignaciones.empleado_responsable_id', $id)
            ->orderBy('asignaciones.created_at', 'DESC')
            ->findAll();

        return $this->respond(['data' => $asignaciones]);
    }
}
