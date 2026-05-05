<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateBienAdjuntos extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'bien_id'    => ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'tipo'       => ['type' => 'VARCHAR', 'constraint' => 50,  'null' => true],
            'nombre'     => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'ruta'       => ['type' => 'VARCHAR', 'constraint' => 500, 'null' => false],
            'hash_sha256'=> ['type' => 'VARCHAR', 'constraint' => 64,  'null' => true],
            'tamano'     => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'mime_type'  => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'subido_por' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addKey('bien_id');
        $this->forge->addForeignKey('bien_id', 'bienes', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('bien_adjuntos');
    }

    public function down(): void
    {
        $this->forge->dropTable('bien_adjuntos');
    }
}
