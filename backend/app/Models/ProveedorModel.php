<?php

namespace App\Models;

use CodeIgniter\Model;

class ProveedorModel extends Model
{
    protected $table         = 'proveedores';
    protected $returnType    = 'array';
    protected $allowedFields = ['nombre', 'rfc', 'contacto', 'telefono', 'email', 'activo'];
    protected $useTimestamps = true;

    protected $validationRules = [
        'nombre' => 'required|max_length[200]',
    ];
}
