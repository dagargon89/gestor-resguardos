<?php

namespace App\Models;

use CodeIgniter\Model;

class UbicacionModel extends Model
{
    protected $table         = 'ubicaciones';
    protected $returnType    = 'array';
    protected $allowedFields = ['nombre', 'descripcion', 'activo'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'nombre' => 'required|max_length[200]',
    ];
}
