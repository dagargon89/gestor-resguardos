<?php
// =============================================================================
// app/Filters/Cors.php
// =============================================================================

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Filtro CORS minimalista. Para producción, mover los orígenes permitidos
 * a .env (CORS_ALLOWED_ORIGINS).
 */
class Cors implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $origin  = $request->getHeaderLine('Origin');
        $allowed = $this->allowedOrigins();

        if ($origin === '' || ! in_array($origin, $allowed, true)) {
            return null;
        }

        $response = service('response');
        $response->setHeader('Access-Control-Allow-Origin',      $origin);
        $response->setHeader('Access-Control-Allow-Credentials', 'true');
        $response->setHeader('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->setHeader('Access-Control-Allow-Headers',     'Content-Type, Authorization, X-Requested-With');
        $response->setHeader('Access-Control-Max-Age',           '86400');

        // Preflight: responder vacío inmediatamente
        if ($request->getMethod() === 'OPTIONS') {
            return $response->setStatusCode(204);
        }

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return $response;
    }

    private function allowedOrigins(): array
    {
        $env = env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173');
        return array_map('trim', explode(',', $env));
    }
}


// =============================================================================
// app/Config/Filters.php — agregar al $aliases y $globals
// =============================================================================
/*
public array $aliases = [
    // ... aliases existentes ...
    'cors'    => \App\Filters\Cors::class,
    'tokens'  => \CodeIgniter\Shield\Filters\TokenAuth::class,
    'session' => \CodeIgniter\Shield\Filters\SessionAuth::class,
];

public array $globals = [
    'before' => [
        'cors',                           // CORS antes que cualquier otra cosa
        // ... otros filtros ...
    ],
    'after' => [
        'cors',                           // y también después para responses
        // ... otros filtros ...
    ],
];
*/


// =============================================================================
// app/Config/Routes.php — fragmento API v1
// =============================================================================

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */

// API REST consumida por el frontend React
$routes->group('api/v1', ['namespace' => 'App\Controllers\Api\V1'], static function ($routes) {

    // --- Auth público ---
    $routes->post('auth/login', 'Auth::login');

    // --- Auth protegido (requiere token de Shield) ---
    $routes->group('', ['filter' => 'tokens'], static function ($routes) {

        $routes->post('auth/logout', 'Auth::logout');
        $routes->get ('auth/me',     'Auth::me');

        // --- Reportes ---
        $routes->get('reports/dashboard',          'Reports::dashboard');
        $routes->get('reports/inventario',         'Reports::inventario');
        $routes->get('reports/inventario/export',  'Reports::inventarioExport');
        $routes->get('reports/bitacora',           'Reports::bitacora');
        $routes->get('reports/bitacora/export',    'Reports::bitacoraExport');

        // --- CRUD de assets (resource genera GET/POST/PUT/DELETE estándar) ---
        $routes->resource('assets', [
            'controller' => 'Assets',
            'except'     => ['new', 'edit'], // no aplican en API JSON
        ]);
        $routes->get('assets/(:num)/historial', 'Assets::historial/$1');

        // --- Catálogos (read-only para el frontend) ---
        $routes->get('catalogs/organizations',  'Catalogs::organizations');
        $routes->get('catalogs/departments',    'Catalogs::departments');
        $routes->get('catalogs/categories',     'Catalogs::categories');
        $routes->get('catalogs/asset-statuses', 'Catalogs::assetStatuses');
        $routes->get('catalogs/currencies',     'Catalogs::currencies');
        $routes->get('catalogs/resguardantes',  'Catalogs::resguardantes');
    });
});


// =============================================================================
// .env — variables nuevas
// =============================================================================
/*
# Frontend permitido para CORS (separar por coma para múltiples)
CORS_ALLOWED_ORIGINS = http://localhost:5173,https://inventario.planjuarez.org

# Shield: forzar tokens API en lugar de sesión por default
auth.defaultGroup     = capturista
auth.authenticator    = tokens
*/
