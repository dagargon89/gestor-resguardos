<?php

namespace App\Models;

use CodeIgniter\Model;

class CategoriaBienModel extends Model
{
    protected $table         = 'categorias_bien';
    protected $returnType    = 'array';
    protected $allowedFields = ['nombre', 'descripcion', 'activo'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'nombre' => 'required|max_length[150]',
    ];
}
