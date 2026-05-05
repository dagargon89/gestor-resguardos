<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDocumentosGenerados extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'asignacion_id'      => ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'tipo_plantilla'     => ['type' => 'ENUM', 'constraint' => ['resguardo', 'prestamo'], 'null' => false],
            'version'            => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => '1.0'],
            'ruta'               => ['type' => 'VARCHAR', 'constraint' => 500, 'null' => true],
            'hash_sha256'        => ['type' => 'VARCHAR', 'constraint' => 64,  'null' => true],
            'generado_por'       => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'generado_en'        => ['type' => 'DATETIME', 'null' => true],
            'created_at'         => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addKey('asignacion_id');
        $this->forge->addForeignKey('asignacion_id', 'asignaciones', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('documentos_generados');
    }

    public function down(): void
    {
        $this->forge->dropTable('documentos_generados');
    }
}
