<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateOrganizaciones extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'nombre'      => ['type' => 'VARCHAR', 'constraint' => 200, 'null' => false],
            'clave'       => ['type' => 'VARCHAR', 'constraint' => 50,  'null' => true],
            'descripcion' => ['type' => 'TEXT',    'null' => true],
            'activo'      => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at'  => ['type' => 'DATETIME', 'null' => true],
            'updated_at'  => ['type' => 'DATETIME', 'null' => true],
            'deleted_at'  => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addUniqueKey('nombre');
        $this->forge->createTable('organizaciones');
    }

    public function down(): void
    {
        $this->forge->dropTable('organizaciones');
    }
}
