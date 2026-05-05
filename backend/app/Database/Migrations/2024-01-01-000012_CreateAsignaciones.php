<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAsignaciones extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'folio'                  => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'tipo'                   => ['type' => 'ENUM', 'constraint' => ['resguardo', 'prestamo'], 'null' => false],
            'estado'                 => ['type' => 'ENUM', 'constraint' => ['borrador', 'activa', 'devuelta', 'transferida', 'cancelada'], 'default' => 'borrador'],
            'empleado_responsable_id'=> ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'inicio'                 => ['type' => 'DATE', 'null' => false],
            'fin_prevista'           => ['type' => 'DATE', 'null' => true],
            'fin_real'               => ['type' => 'DATE', 'null' => true],
            'condiciones'            => ['type' => 'TEXT', 'null' => true, 'comment' => 'Snapshot cláusulas'],
            'observaciones'          => ['type' => 'TEXT', 'null' => true],
            'creado_por'             => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'created_at'             => ['type' => 'DATETIME', 'null' => true],
            'updated_at'             => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addUniqueKey('folio');
        $this->forge->addKey(['empleado_responsable_id', 'estado']);
        $this->forge->addForeignKey('empleado_responsable_id', 'empleados', 'id', 'RESTRICT', 'CASCADE');
        $this->forge->createTable('asignaciones');
    }

    public function down(): void
    {
        $this->forge->dropTable('asignaciones');
    }
}
