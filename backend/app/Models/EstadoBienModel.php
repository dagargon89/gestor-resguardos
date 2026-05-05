<?php

namespace App\Models;

use CodeIgniter\Model;

class EstadoBienModel extends Model
{
    protected $table         = 'estados_bien';
    protected $returnType    = 'array';
    protected $allowedFields = ['nombre', 'color', 'es_activo'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'nombre' => 'required|max_length[100]',
    ];
}
