<?php

namespace App\Services;

use CodeIgniter\Database\BaseConnection;

class FolioService
{
    private BaseConnection $db;

    public function __construct()
    {
        $this->db = db_connect();
    }

    /**
     * Genera un folio único dentro de una transacción atómica.
     * Formato: <PREFIJO>-<AÑO>-<SECUENCIA_CERO_RELLENA>
     */
    public function generarFolio(string $tipo): string
    {
        $this->db->transStart();

        $claveSecuencia = 'folio_secuencia';
        $claveAnio      = 'folio_anio';
        $clavePrefijo   = $tipo === 'prestamo' ? 'folio_prestamo_prefijo' : 'folio_prefijo';

        // Bloqueo pesimista de la fila de configuración
        $row = $this->db->query(
            "SELECT valor FROM configuracion WHERE clave = ? FOR UPDATE",
            [$claveSecuencia]
        )->getRowArray();

        $secuencia = (int) ($row['valor'] ?? 0) + 1;
        $anio      = $this->db->table('configuracion')->where('clave', $claveAnio)->get()->getRowArray()['valor'] ?? date('Y');
        $prefijo   = $this->db->table('configuracion')->where('clave', $clavePrefijo)->get()->getRowArray()['valor'] ?? 'RSG';

        $this->db->table('configuracion')
            ->where('clave', $claveSecuencia)
            ->update(['valor' => $secuencia, 'updated_at' => date('Y-m-d H:i:s')]);

        $this->db->transComplete();

        return sprintf('%s-%s-%04d', strtoupper($prefijo), $anio, $secuencia);
    }
}
