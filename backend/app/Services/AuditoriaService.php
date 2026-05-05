<?php

namespace App\Services;

use CodeIgniter\Database\BaseConnection;

class AuditoriaService
{
    private BaseConnection $db;

    public function __construct()
    {
        $this->db = db_connect();
    }

    public function registrar(
        string $tabla,
        int    $registroId,
        string $accion,
        ?array $anterior = null,
        ?array $nuevo    = null,
        ?int   $usuarioId = null
    ): void {
        $request = service('request');
        $this->db->table('auditoria_cambios')->insert([
            'tabla'              => $tabla,
            'registro_id'        => $registroId,
            'accion'             => $accion,
            'usuario_id'         => $usuarioId,
            'ip'                 => $request->getIPAddress(),
            'user_agent'         => substr($request->getUserAgent()->getAgentString(), 0, 300),
            'valores_anteriores' => $anterior ? json_encode($anterior) : null,
            'valores_nuevos'     => $nuevo    ? json_encode($nuevo)    : null,
            'created_at'         => date('Y-m-d H:i:s'),
        ]);
    }
}
