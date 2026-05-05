<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Models\DepartamentoModel;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class Departamentos extends BaseController
{
    use ResponseTrait;

    private DepartamentoModel $model;

    public function __construct()
    {
        $this->model = model(DepartamentoModel::class);
    }

    public function index(): ResponseInterface
    {
        $page    = (int) ($this->request->getGet('page') ?? 1);
        $perPage = min((int) ($this->request->getGet('per_page') ?? 50), 200);
        $orgId   = $this->request->getGet('organizacion_id');

        $m = $this->model->select('departamentos.*, org.nombre AS organizacion')
            ->join('organizaciones org', 'org.id = departamentos.organizacion_id', 'left')
            ->orderBy('departamentos.nombre');

        if ($orgId) $m->where('departamentos.organizacion_id', $orgId);

        $total = $m->countAllResults(false);
        $rows  = $m->limit($perPage, ($page - 1) * $perPage)->findAll();

        return $this->respond([
            'data' => $rows,
            'meta' => compact('page', 'perPage', 'total'),
        ]);
    }

    public function show(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Departamento no encontrado');
        return $this->respond(['data' => $row]);
    }

    public function create(): ResponseInterface
    {
        $data = $this->request->getJSON(true);
        if (! $this->model->validate($data)) {
            return $this->failValidationErrors($this->model->errors());
        }
        $id = $this->model->insert($data);
        return $this->respondCreated(['data' => $this->model->find($id)]);
    }

    public function update(int $id): ResponseInterface
    {
        if (! $this->model->find($id)) return $this->failNotFound('Departamento no encontrado');
        $data = $this->request->getJSON(true);
        $this->model->update($id, $data);
        return $this->respond(['data' => $this->model->find($id)]);
    }

    public function delete(int $id): ResponseInterface
    {
        if (! $this->model->find($id)) return $this->failNotFound('Departamento no encontrado');
        $this->model->delete($id);
        return $this->respondDeleted(['data' => ['message' => 'Eliminado']]);
    }
}
