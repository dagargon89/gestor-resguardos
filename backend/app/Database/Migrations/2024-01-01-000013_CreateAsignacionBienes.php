<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAsignacionBienes extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'asignacion_id' => ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'bien_id'       => ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'cantidad'      => ['type' => 'INT', 'unsigned' => true, 'default' => 1],
            'notas'         => ['type' => 'TEXT', 'null' => true],
            'created_at'    => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addKey('bien_id');
        $this->forge->addForeignKey('asignacion_id', 'asignaciones', 'id', 'CASCADE',  'CASCADE');
        $this->forge->addForeignKey('bien_id',       'bienes',       'id', 'RESTRICT', 'CASCADE');
        $this->forge->createTable('asignacion_bienes');
    }

    public function down(): void
    {
        $this->forge->dropTable('asignacion_bienes');
    }
}
