<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateEmpleados extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'numero_empleado'  => ['type' => 'VARCHAR', 'constraint' => 50,  'null' => true],
            'nombre'           => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => false],
            'apellido_paterno' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => false],
            'apellido_materno' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'puesto'           => ['type' => 'VARCHAR', 'constraint' => 200, 'null' => true],
            'departamento_id'  => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'organizacion_id'  => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'email'            => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'telefono'         => ['type' => 'VARCHAR', 'constraint' => 30,  'null' => true],
            'activo'           => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at'       => ['type' => 'DATETIME', 'null' => true],
            'updated_at'       => ['type' => 'DATETIME', 'null' => true],
            'deleted_at'       => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addKey('departamento_id');
        $this->forge->addKey('organizacion_id');
        $this->forge->addForeignKey('departamento_id', 'departamentos',   'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('organizacion_id', 'organizaciones',  'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('empleados');
    }

    public function down(): void
    {
        $this->forge->dropTable('empleados');
    }
}
