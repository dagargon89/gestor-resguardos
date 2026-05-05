<?php

namespace App\Models;

use CodeIgniter\Model;

class MovimientoPatrimonialModel extends Model
{
    protected $table         = 'movimientos_patrimoniales';
    protected $returnType    = 'array';
    protected $allowedFields = [
        'bien_id', 'tipo', 'campo_afectado', 'valor_anterior', 'valor_nuevo', 'motivo', 'usuario_id', 'ip',
    ];
    protected $useTimestamps  = true;
    protected $updatedField   = '';

    public function conteoPorTipo(string $desde, string $hasta): array
    {
        return $this->db->table('movimientos_patrimoniales')
            ->select('tipo, COUNT(*) as total')
            ->where('created_at >=', $desde)
            ->where('created_at <=', $hasta)
            ->groupBy('tipo')
            ->get()->getResultArray();
    }

    public function reporteRango(string $desde, string $hasta, ?int $orgId = null): array
    {
        $b = $this->db->table('movimientos_patrimoniales mp')
            ->select([
                'mp.created_at', 'mp.tipo', 'mp.campo_afectado', 'mp.valor_anterior', 'mp.valor_nuevo', 'mp.motivo',
                'b.codigo_interno', 'b.nombre AS activo_nombre',
                'org.nombre AS organizacion',
                'u.username AS usuario',
            ])
            ->join('bienes b',       'b.id = mp.bien_id',          'left')
            ->join('organizaciones org','org.id = b.organizacion_id','left')
            ->join('users u',        'u.id = mp.usuario_id',        'left')
            ->where('mp.created_at >=', $desde)
            ->where('mp.created_at <=', $hasta);

        if ($orgId !== null) {
            $b->where('b.organizacion_id', $orgId);
        }

        return $b->orderBy('mp.created_at', 'DESC')->get()->getResultArray();
    }
}
