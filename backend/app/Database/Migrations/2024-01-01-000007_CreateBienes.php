<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateBienes extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'codigo_interno'   => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => false],
            'nombre'           => ['type' => 'VARCHAR', 'constraint' => 300, 'null' => false],
            'descripcion'      => ['type' => 'TEXT',    'null' => true],
            'marca'            => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'modelo'           => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'numero_serie'     => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'organizacion_id'  => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'categoria_id'     => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'estado_bien_id'   => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'ubicacion_id'     => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'proveedor_id'     => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'precio_unitario'  => ['type' => 'DECIMAL', 'constraint' => '15,2', 'null' => true],
            'moneda'           => ['type' => 'VARCHAR', 'constraint' => 10, 'default' => 'MXN'],
            'fecha_adquisicion'=> ['type' => 'DATE', 'null' => true],
            'numero_factura'   => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'atributos_extra'  => ['type' => 'JSON', 'null' => true],
            'activo'           => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at'       => ['type' => 'DATETIME', 'null' => true],
            'updated_at'       => ['type' => 'DATETIME', 'null' => true],
            'deleted_at'       => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addUniqueKey('codigo_interno');
        $this->forge->addKey(['organizacion_id']);
        $this->forge->addKey(['estado_bien_id']);
        $this->forge->addForeignKey('organizacion_id', 'organizaciones',  'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('categoria_id',    'categorias_bien', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('estado_bien_id',  'estados_bien',    'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('ubicacion_id',    'ubicaciones',     'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('proveedor_id',    'proveedores',     'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('bienes');
    }

    public function down(): void
    {
        $this->forge->dropTable('bienes');
    }
}
