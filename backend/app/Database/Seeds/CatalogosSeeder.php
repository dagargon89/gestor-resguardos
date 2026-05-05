<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class CatalogosSeeder extends Seeder
{
    public function run(): void
    {
        // Estados de bien
        $estados = [
            ['nombre' => 'Disponible',     'color' => 'green',  'es_activo' => 1],
            ['nombre' => 'Asignado',       'color' => 'blue',   'es_activo' => 1],
            ['nombre' => 'En reparación',  'color' => 'yellow', 'es_activo' => 0],
            ['nombre' => 'Baja',           'color' => 'red',    'es_activo' => 0],
            ['nombre' => 'Extraviado',     'color' => 'orange', 'es_activo' => 0],
            ['nombre' => 'En préstamo',    'color' => 'purple', 'es_activo' => 1],
        ];
        foreach ($estados as $e) {
            $this->db->table('estados_bien')->insert(array_merge($e, [
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]));
        }

        // Categorías de bien
        $categorias = [
            'Cómputo', 'Mobiliario', 'Audio y video', 'Herramientas',
            'Comunicaciones', 'Vehículos', 'Equipamiento de oficina', 'Otro',
        ];
        foreach ($categorias as $c) {
            $this->db->table('categorias_bien')->insert([
                'nombre'     => $c,
                'activo'     => 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }

        // Configuración inicial
        $config = [
            ['clave' => 'folio_prefijo',        'valor' => 'RSG',  'descripcion' => 'Prefijo para folios de resguardo'],
            ['clave' => 'folio_prestamo_prefijo','valor' => 'PRE',  'descripcion' => 'Prefijo para folios de préstamo'],
            ['clave' => 'folio_anio',            'valor' => date('Y'), 'descripcion' => 'Año fiscal de la secuencia de folios'],
            ['clave' => 'folio_secuencia',       'valor' => '0',    'descripcion' => 'Contador de folios (se incrementa automáticamente)'],
            ['clave' => 'empresa_nombre',        'valor' => 'Mi Organización', 'descripcion' => 'Nombre que aparece en cartas'],
        ];
        foreach ($config as $c) {
            $this->db->table('configuracion')->insert(array_merge($c, ['updated_at' => date('Y-m-d H:i:s')]));
        }
    }
}
