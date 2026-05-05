<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUbicaciones extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'nombre'      => ['type' => 'VARCHAR', 'constraint' => 200, 'null' => false],
            'descripcion' => ['type' => 'TEXT', 'null' => true],
            'activo'      => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at'  => ['type' => 'DATETIME', 'null' => true],
            'updated_at'  => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->createTable('ubicaciones');
    }

    public function down(): void
    {
        $this->forge->dropTable('ubicaciones');
    }
}
