<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateEstadosBien extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'nombre'      => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => false],
            'color'       => ['type' => 'VARCHAR', 'constraint' => 20,  'null' => true],
            'es_activo'   => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1, 'comment' => 'Bien disponible u operativo'],
            'created_at'  => ['type' => 'DATETIME', 'null' => true],
            'updated_at'  => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addUniqueKey('nombre');
        $this->forge->createTable('estados_bien');
    }

    public function down(): void
    {
        $this->forge->dropTable('estados_bien');
    }
}
