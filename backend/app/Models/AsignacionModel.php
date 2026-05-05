<?php

namespace App\Models;

use CodeIgniter\Model;

class AsignacionModel extends Model
{
    protected $table         = 'asignaciones';
    protected $returnType    = 'array';
    protected $allowedFields = [
        'folio', 'tipo', 'estado', 'empleado_responsable_id',
        'inicio', 'fin_prevista', 'fin_real', 'condiciones', 'observaciones', 'creado_por',
    ];
    protected $useTimestamps = true;

    protected $validationRules = [
        'tipo'                    => 'required|in_list[resguardo,prestamo]',
        'empleado_responsable_id' => 'required|integer',
        'inicio'                  => 'required|valid_date[Y-m-d]',
    ];

    public function conRelaciones(): self
    {
        return $this->select([
                'asignaciones.*',
                "CONCAT(emp.nombre,' ',emp.apellido_paterno) AS empleado_nombre",
                'emp.puesto AS empleado_puesto',
                'org.nombre AS organizacion',
                'dep.nombre AS departamento',
            ])
            ->join('empleados emp',   'emp.id = asignaciones.empleado_responsable_id', 'left')
            ->join('organizaciones org','org.id = emp.organizacion_id',                'left')
            ->join('departamentos dep', 'dep.id = emp.departamento_id',                'left');
    }

    public function bienesDeAsignacion(int $asignacionId): array
    {
        return $this->db->table('asignacion_bienes ab')
            ->select([
                'ab.id', 'ab.bien_id', 'ab.cantidad', 'ab.notas',
                'b.codigo_interno', 'b.nombre', 'b.marca', 'b.modelo', 'b.numero_serie',
                'est.nombre AS estado', 'est.color AS estado_color',
            ])
            ->join('bienes b',       'b.id = ab.bien_id',          'left')
            ->join('estados_bien est','est.id = b.estado_bien_id',  'left')
            ->where('ab.asignacion_id', $asignacionId)
            ->get()->getResultArray();
    }
}
