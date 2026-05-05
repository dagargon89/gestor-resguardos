<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Models\OrganizacionModel;
use App\Models\DepartamentoModel;
use App\Models\CategoriaBienModel;
use App\Models\EstadoBienModel;
use App\Models\UbicacionModel;
use App\Models\ProveedorModel;
use App\Models\EmpleadoModel;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class Catalogs extends BaseController
{
    use ResponseTrait;

    public function organizaciones(): ResponseInterface
    {
        $rows = model(OrganizacionModel::class)->where('activo', 1)->orderBy('nombre')->findAll();
        return $this->respond(['data' => $rows]);
    }

    public function departamentos(): ResponseInterface
    {
        $orgId = $this->request->getGet('organizacion_id');
        $m = model(DepartamentoModel::class)->where('activo', 1)->orderBy('nombre');
        if ($orgId) $m->where('organizacion_id', $orgId);
        return $this->respond(['data' => $m->findAll()]);
    }

    public function categorias(): ResponseInterface
    {
        $rows = model(CategoriaBienModel::class)->where('activo', 1)->orderBy('nombre')->findAll();
        return $this->respond(['data' => $rows]);
    }

    public function estadosBien(): ResponseInterface
    {
        $rows = model(EstadoBienModel::class)->orderBy('nombre')->findAll();
        return $this->respond(['data' => $rows]);
    }

    public function ubicaciones(): ResponseInterface
    {
        $rows = model(UbicacionModel::class)->where('activo', 1)->orderBy('nombre')->findAll();
        return $this->respond(['data' => $rows]);
    }

    public function proveedores(): ResponseInterface
    {
        $rows = model(ProveedorModel::class)->where('activo', 1)->orderBy('nombre')->findAll();
        return $this->respond(['data' => $rows]);
    }
}
