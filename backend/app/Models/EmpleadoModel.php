<?php

namespace App\Models;

use CodeIgniter\Model;

class EmpleadoModel extends Model
{
    protected $table          = 'empleados';
    protected $returnType     = 'array';
    protected $useSoftDeletes = true;
    protected $allowedFields  = [
        'numero_empleado', 'nombre', 'apellido_paterno', 'apellido_materno',
        'puesto', 'departamento_id', 'organizacion_id', 'email', 'telefono', 'activo',
    ];
    protected $useTimestamps = true;
    protected $deletedField  = 'deleted_at';

    protected $validationRules = [
        'nombre'           => 'required|max_length[100]',
        'apellido_paterno' => 'required|max_length[100]',
    ];

    public function nombreCompleto(array $row): string
    {
        return trim("{$row['nombre']} {$row['apellido_paterno']} {$row['apellido_materno']}");
    }

    public function listadoConRelaciones(array $filtros = [], int $page = 1, int $perPage = 50): array
    {
        $b = $this->select([
                'empleados.id', 'empleados.numero_empleado', 'empleados.nombre',
                'empleados.apellido_paterno', 'empleados.apellido_materno',
                'empleados.puesto', 'empleados.email', 'empleados.activo',
                'dep.nombre AS departamento',
                'org.nombre AS organizacion',
                "CONCAT(empleados.nombre,' ',empleados.apellido_paterno,' ',COALESCE(empleados.apellido_materno,'')) AS nombre_completo",
            ])
            ->join('departamentos dep', 'dep.id = empleados.departamento_id', 'left')
            ->join('organizaciones org','org.id = empleados.organizacion_id',  'left');

        if (! empty($filtros['organizacion_id'])) $b->where('empleados.organizacion_id', $filtros['organizacion_id']);
        if (! empty($filtros['departamento_id'])) $b->where('empleados.departamento_id', $filtros['departamento_id']);
        if (isset($filtros['activo']))             $b->where('empleados.activo',          $filtros['activo']);

        if (! empty($filtros['q'])) {
            $b->groupStart()
              ->like('empleados.nombre',           $filtros['q'])
              ->orLike('empleados.apellido_paterno',$filtros['q'])
              ->orLike('empleados.numero_empleado', $filtros['q'])
              ->groupEnd();
        }

        $total = $b->countAllResults(false);
        $rows  = $b->orderBy('empleados.apellido_paterno')
                   ->limit($perPage, ($page - 1) * $perPage)
                   ->findAll();

        return ['total' => $total, 'rows' => $rows];
    }
}
