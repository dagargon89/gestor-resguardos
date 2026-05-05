<?php

namespace App\Models;

use CodeIgniter\Model;

class BienModel extends Model
{
    protected $table          = 'bienes';
    protected $returnType     = 'array';
    protected $useSoftDeletes = true;
    protected $allowedFields  = [
        'codigo_interno', 'nombre', 'descripcion', 'marca', 'modelo', 'numero_serie',
        'organizacion_id', 'categoria_id', 'estado_bien_id', 'ubicacion_id', 'proveedor_id',
        'precio_unitario', 'moneda', 'fecha_adquisicion', 'numero_factura', 'atributos_extra', 'activo',
    ];
    protected $useTimestamps = true;
    protected $deletedField  = 'deleted_at';

    protected $validationRules = [
        'codigo_interno' => 'required|max_length[100]',
        'nombre'         => 'required|max_length[300]',
    ];

    public function listadoConRelaciones(array $filtros = [], int $page = 1, int $perPage = 50): array
    {
        $b = $this->select([
                'bienes.id', 'bienes.codigo_interno', 'bienes.nombre', 'bienes.marca', 'bienes.modelo',
                'bienes.numero_serie', 'bienes.precio_unitario', 'bienes.moneda', 'bienes.fecha_adquisicion', 'bienes.activo',
                'org.nombre AS organizacion',
                'cat.nombre AS categoria',
                'est.nombre AS estado', 'est.color AS estado_color',
                'ubi.nombre AS ubicacion',
            ])
            ->join('organizaciones org', 'org.id = bienes.organizacion_id', 'left')
            ->join('categorias_bien cat','cat.id = bienes.categoria_id',    'left')
            ->join('estados_bien est',  'est.id = bienes.estado_bien_id',   'left')
            ->join('ubicaciones ubi',   'ubi.id = bienes.ubicacion_id',     'left');

        if (! empty($filtros['organizacion_id'])) $b->where('bienes.organizacion_id', $filtros['organizacion_id']);
        if (! empty($filtros['categoria_id']))     $b->where('bienes.categoria_id',    $filtros['categoria_id']);
        if (! empty($filtros['estado_bien_id']))   $b->where('bienes.estado_bien_id',  $filtros['estado_bien_id']);
        if (! empty($filtros['activo']))            $b->where('bienes.activo',          $filtros['activo']);

        if (! empty($filtros['q'])) {
            $b->groupStart()
              ->like('bienes.codigo_interno', $filtros['q'])
              ->orLike('bienes.nombre',       $filtros['q'])
              ->orLike('bienes.numero_serie', $filtros['q'])
              ->groupEnd();
        }

        $total = $b->countAllResults(false);
        $rows  = $b->orderBy('bienes.codigo_interno')
                   ->limit($perPage, ($page - 1) * $perPage)
                   ->findAll();

        return ['total' => $total, 'rows' => $rows];
    }
}
