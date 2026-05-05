<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddEmpleadoIdToUsers extends Migration
{
    public function up(): void
    {
        $this->forge->addColumn('users', [
            'empleado_id' => [
                'type'       => 'INT',
                'unsigned'   => true,
                'null'       => true,
                'after'      => 'username',
            ],
        ]);
        // Índice único parcial para empleado_id (solo cuando no es NULL — no soportado en MySQL estándar,
        // se aplica unicidad a nivel de aplicación y/o trigger)
        $this->db->query('ALTER TABLE `users` ADD UNIQUE KEY `users_empleado_id_unique` (`empleado_id`)');
    }

    public function down(): void
    {
        $this->forge->dropColumn('users', 'empleado_id');
    }
}
