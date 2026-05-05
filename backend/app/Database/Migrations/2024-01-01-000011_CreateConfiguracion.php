<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateConfiguracion extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'clave'       => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => false],
            'valor'       => ['type' => 'TEXT', 'null' => true],
            'descripcion' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'updated_at'  => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addUniqueKey('clave');
        $this->forge->createTable('configuracion');
    }

    public function down(): void
    {
        $this->forge->dropTable('configuracion');
    }
}
