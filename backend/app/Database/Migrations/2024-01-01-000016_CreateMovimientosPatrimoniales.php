<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateMovimientosPatrimoniales extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'bien_id'         => ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'tipo'            => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false, 'comment' => 'alta,baja,traslado,ajuste,reparacion,asignacion,devolucion'],
            'campo_afectado'  => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'valor_anterior'  => ['type' => 'TEXT', 'null' => true],
            'valor_nuevo'     => ['type' => 'TEXT', 'null' => true],
            'motivo'          => ['type' => 'TEXT', 'null' => true],
            'usuario_id'      => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'ip'              => ['type' => 'VARCHAR', 'constraint' => 45, 'null' => true],
            'created_at'      => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addKey('bien_id');
        $this->forge->addKey('tipo');
        $this->forge->addForeignKey('bien_id', 'bienes', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('movimientos_patrimoniales');
    }

    public function down(): void
    {
        $this->forge->dropTable('movimientos_patrimoniales');
    }
}
