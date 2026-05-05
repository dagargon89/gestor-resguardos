<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateProveedores extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'nombre'    => ['type' => 'VARCHAR', 'constraint' => 200, 'null' => false],
            'rfc'       => ['type' => 'VARCHAR', 'constraint' => 20,  'null' => true],
            'contacto'  => ['type' => 'VARCHAR', 'constraint' => 200, 'null' => true],
            'telefono'  => ['type' => 'VARCHAR', 'constraint' => 30,  'null' => true],
            'email'     => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'activo'    => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->createTable('proveedores');
    }

    public function down(): void
    {
        $this->forge->dropTable('proveedores');
    }
}
