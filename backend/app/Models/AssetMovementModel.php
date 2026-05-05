<?php

namespace App\Models;

/**
 * Alias de MovimientoPatrimonialModel para compatibilidad con el controlador Reports del prototipo.
 */
class AssetMovementModel extends MovimientoPatrimonialModel
{
    protected $table = 'movimientos_patrimoniales';
}
