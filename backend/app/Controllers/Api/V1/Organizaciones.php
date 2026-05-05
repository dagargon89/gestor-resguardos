<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Models\OrganizacionModel;
use App\Services\AuditoriaService;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class Organizaciones extends BaseController
{
    use ResponseTrait;

    private OrganizacionModel $model;
    private AuditoriaService  $auditoria;

    public function __construct()
    {
        $this->model     = model(OrganizacionModel::class);
        $this->auditoria = new AuditoriaService();
    }

    public function index(): ResponseInterface
    {
        $page    = (int) ($this->request->getGet('page') ?? 1);
        $perPage = min((int) ($this->request->getGet('per_page') ?? 50), 200);
        $q       = $this->request->getGet('q');

        $m = $this->model->orderBy('nombre');
        if ($q) $m->like('nombre', $q);

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
        if (! $row) return $this->failNotFound('Organización no encontrada');
        return $this->respond(['data' => $row]);
    }

    public function create(): ResponseInterface
    {
        $data = $this->request->getJSON(true);
        if (! $this->model->validate($data)) {
            return $this->failValidationErrors($this->model->errors());
        }
        $id = $this->model->insert($data);
        $this->auditoria->registrar('organizaciones', $id, 'insert', null, $data, auth()->id());
        return $this->respondCreated(['data' => $this->model->find($id)]);
    }

    public function update(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Organización no encontrada');
        $data = $this->request->getJSON(true);
        $this->model->update($id, $data);
        $this->auditoria->registrar('organizaciones', $id, 'update', $row, $data, auth()->id());
        return $this->respond(['data' => $this->model->find($id)]);
    }

    public function delete(int $id): ResponseInterface
    {
        $row = $this->model->find($id);
        if (! $row) return $this->failNotFound('Organización no encontrada');
        $this->model->delete($id);
        $this->auditoria->registrar('organizaciones', $id, 'delete', $row, null, auth()->id());
        return $this->respondDeleted(['data' => ['message' => 'Eliminada']]);
    }
}
