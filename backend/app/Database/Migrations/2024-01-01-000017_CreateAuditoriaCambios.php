<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAuditoriaCambios extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'BIGINT', 'unsigned' => true, 'auto_increment' => true],
            'tabla'             => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => false],
            'registro_id'       => ['type' => 'INT', 'unsigned' => true, 'null' => false],
            'accion'            => ['type' => 'ENUM', 'constraint' => ['insert', 'update', 'delete'], 'null' => false],
            'usuario_id'        => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'ip'                => ['type' => 'VARCHAR', 'constraint' => 45, 'null' => true],
            'user_agent'        => ['type' => 'VARCHAR', 'constraint' => 300, 'null' => true],
            'valores_anteriores'=> ['type' => 'JSON', 'null' => true],
            'valores_nuevos'    => ['type' => 'JSON', 'null' => true],
            'created_at'        => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addKey(['tabla', 'registro_id']);
        $this->forge->addKey('usuario_id');
        $this->forge->createTable('auditoria_cambios');
    }

    public function down(): void
    {
        $this->forge->dropTable('auditoria_cambios');
    }
}
