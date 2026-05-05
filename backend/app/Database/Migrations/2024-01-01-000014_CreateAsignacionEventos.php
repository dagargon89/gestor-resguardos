<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAsignacionEventos extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'asignacion_id' => ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'tipo'          => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false, 'comment' => 'devolucion,transferencia,renovacion,cancelacion,etc'],
            'descripcion'   => ['type' => 'TEXT', 'null' => true],
            'payload_json'  => ['type' => 'JSON', 'null' => true],
            'usuario_id'    => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'created_at'    => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addKey('asignacion_id');
        $this->forge->addForeignKey('asignacion_id', 'asignaciones', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('asignacion_eventos');
    }

    public function down(): void
    {
        $this->forge->dropTable('asignacion_eventos');
    }
}
