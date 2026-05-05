<?php

namespace App\Models;

use CodeIgniter\Model;

class DepartamentoModel extends Model
{
    protected $table         = 'departamentos';
    protected $returnType    = 'array';
    protected $allowedFields = ['nombre', 'organizacion_id', 'activo'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'nombre' => 'required|max_length[200]',
    ];
}
