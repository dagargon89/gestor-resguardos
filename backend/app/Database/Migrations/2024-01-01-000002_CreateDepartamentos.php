<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDepartamentos extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'nombre'          => ['type' => 'VARCHAR', 'constraint' => 200, 'null' => false],
            'organizacion_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'activo'          => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at'      => ['type' => 'DATETIME', 'null' => true],
            'updated_at'      => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('organizacion_id', 'organizaciones', 'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('departamentos');
    }

    public function down(): void
    {
        $this->forge->dropTable('departamentos');
    }
}
