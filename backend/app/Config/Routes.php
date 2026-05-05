<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */

// Endpoint de salud
$routes->get('api/v1/health', static function () {
    return service('response')
        ->setStatusCode(200)
        ->setJSON(['data' => ['status' => 'ok', 'timestamp' => date('c')]]);
});

// API v1
$routes->group('api/v1', ['namespace' => 'App\Controllers\Api\V1'], static function ($routes) {

    // Auth público
    $routes->post('auth/login', 'Auth::login');

    // Auth y recursos protegidos
    $routes->group('', ['filter' => 'tokens'], static function ($routes) {

        // Auth
        $routes->post('auth/logout', 'Auth::logout');
        $routes->get('auth/me',      'Auth::me');

        // Reportes / dashboard
        $routes->get('reports/dashboard',         'Reports::dashboard');
        $routes->get('reports/inventario',        'Reports::inventario');
        $routes->get('reports/inventario/export', 'Reports::inventarioExport');
        $routes->get('reports/bitacora',          'Reports::bitacora');
        $routes->get('reports/bitacora/export',   'Reports::bitacoraExport');

        // Catálogos (read-only)
        $routes->get('catalogs/organizaciones',   'Catalogs::organizaciones');
        $routes->get('catalogs/departamentos',    'Catalogs::departamentos');
        $routes->get('catalogs/categorias',       'Catalogs::categorias');
        $routes->get('catalogs/estados-bien',     'Catalogs::estadosBien');
        $routes->get('catalogs/ubicaciones',      'Catalogs::ubicaciones');
        $routes->get('catalogs/proveedores',      'Catalogs::proveedores');

        // CRUD Organizaciones
        $routes->resource('organizaciones', [
            'controller' => 'Organizaciones',
            'except'     => ['new', 'edit'],
        ]);

        // CRUD Departamentos
        $routes->resource('departamentos', [
            'controller' => 'Departamentos',
            'except'     => ['new', 'edit'],
        ]);

        // CRUD Empleados
        $routes->resource('empleados', [
            'controller' => 'Empleados',
            'except'     => ['new', 'edit'],
        ]);
        $routes->get('empleados/(:num)/asignaciones', 'Empleados::asignaciones/$1');

        // CRUD Bienes
        $routes->resource('bienes', [
            'controller' => 'Bienes',
            'except'     => ['new', 'edit'],
        ]);
        $routes->get('bienes/(:num)/movimientos', 'Bienes::movimientos/$1');
        $routes->get('bienes/(:num)/adjuntos',    'Bienes::adjuntos/$1');
        $routes->post('bienes/(:num)/adjuntos',   'Bienes::subirAdjunto/$1');

        // CRUD Asignaciones (resguardos y préstamos)
        $routes->resource('asignaciones', [
            'controller' => 'Asignaciones',
            'except'     => ['new', 'edit'],
        ]);
        $routes->post('asignaciones/(:num)/devolver',    'Asignaciones::devolver/$1');
        $routes->post('asignaciones/(:num)/transferir',  'Asignaciones::transferir/$1');
        $routes->post('asignaciones/(:num)/cancelar',    'Asignaciones::cancelar/$1');
        $routes->get('asignaciones/(:num)/eventos',      'Asignaciones::eventos/$1');
        $routes->get('asignaciones/(:num)/documentos',   'Asignaciones::documentos/$1');

        // Cartas / documentos PDF
        $routes->get('cartas/(:num)/html',       'Cartas::html/$1');
        $routes->post('cartas/(:num)/generar',   'Cartas::generar/$1');
        $routes->get('cartas/documento/(:num)',  'Cartas::descargar/$1');

        // Usuarios internos (admin)
        $routes->get('usuarios',                     'Usuarios::index');
        $routes->get('usuarios/(:num)',              'Usuarios::show/$1');
        $routes->post('usuarios',                    'Usuarios::create');
        $routes->put('usuarios/(:num)',              'Usuarios::update/$1');
        $routes->delete('usuarios/(:num)',           'Usuarios::delete/$1');

        // Reportes de asignaciones
        $routes->get('reports/asignaciones',         'Reports::asignaciones');
        $routes->get('reports/asignaciones/export',  'Reports::asignacionesExport');
    });

    // Portal empleado (acceso por token + validación adicional de rol)
    $routes->group('portal', ['filter' => 'tokens'], static function ($routes) {
        $routes->get('mis-asignaciones',             'Portal::misAsignaciones');
        $routes->get('mis-asignaciones/(:num)',      'Portal::detalleAsignacion/$1');
        $routes->get('mis-documentos',               'Portal::misDocumentos');
        $routes->get('descargar/(:num)',             'Portal::descargar/$1');
        $routes->get('perfil',                       'Portal::perfil');
    });
});
