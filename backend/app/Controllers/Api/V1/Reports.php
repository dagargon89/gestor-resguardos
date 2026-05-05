<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Models\AssetModel;
use App\Models\AssetMovementModel;
use App\Services\ExportService;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\API\ResponseTrait;

/**
 * API REST de reportes para el frontend React.
 *
 * Respuestas: siempre JSON con shape { data, meta?, error? }.
 * Auth: vía filtro 'tokens' (Shield Access Tokens) — Authorization: Bearer <token>.
 *
 * Endpoints:
 *  GET  /api/v1/reports/dashboard          → KPIs + serie de movimientos
 *  GET  /api/v1/reports/inventario         → listado paginado + filtros
 *  GET  /api/v1/reports/inventario/export  → XLSX o PDF (binary)
 *  GET  /api/v1/reports/bitacora           → bitácora paginada
 *  GET  /api/v1/reports/bitacora/export    → XLSX o PDF (binary)
 */
class Reports extends BaseController
{
    use ResponseTrait;

    private AssetModel         $assets;
    private AssetMovementModel $movements;
    private ExportService      $exporter;

    public function __construct()
    {
        $this->assets    = model(AssetModel::class);
        $this->movements = model(AssetMovementModel::class);
        $this->exporter  = service('exportService');
    }

    // -------------------- Dashboard --------------------

    public function dashboard(): ResponseInterface
    {
        $hasta = date('Y-m-d 23:59:59');
        $desde = date('Y-m-d 00:00:00', strtotime('-30 days'));

        return $this->respond([
            'data' => [
                'kpis' => [
                    'total_activos'   => $this->assets->countAllResults(),
                    'movimientos_30d' => $this->movements
                                                ->where('created_at >=', $desde)
                                                ->countAllResults(),
                    'activos_baja_30d' => $this->movements
                                                ->where('created_at >=', $desde)
                                                ->where('tipo', 'baja')
                                                ->countAllResults(),
                ],
                'movimientos_por_tipo' => $this->movements->conteoPorTipo($desde, $hasta),
                'rango' => ['desde' => $desde, 'hasta' => $hasta],
            ],
        ]);
    }

    // -------------------- Inventario --------------------

    public function inventario(): ResponseInterface
    {
        $page    = (int) ($this->request->getGet('page') ?? 1);
        $perPage = min((int) ($this->request->getGet('per_page') ?? 50), 200);
        $filtros = $this->extraerFiltrosInventario();

        $query = $this->queryInventario($filtros);
        $total = $query->countAllResults(false);
        $rows  = $query->limit($perPage, ($page - 1) * $perPage)->find();

        return $this->respond([
            'data' => $rows,
            'meta' => [
                'page'        => $page,
                'per_page'    => $perPage,
                'total'       => $total,
                'total_pages' => (int) ceil($total / $perPage),
                'filtros'     => $filtros,
            ],
        ]);
    }

    public function inventarioExport(): ResponseInterface
    {
        $format  = $this->request->getGet('format') ?? 'xlsx';
        $filtros = $this->extraerFiltrosInventario();
        $rows    = $this->queryInventario($filtros)->findAll();

        $headers = [
            'codigo_inventario' => 'Código',
            'serial_interno'    => 'Serial',
            'nombre'            => 'Nombre',
            'marca'             => 'Marca',
            'modelo'            => 'Modelo',
            'organizacion'      => 'Organización',
            'departamento'      => 'Departamento',
            'resguardante'      => 'Resguardante',
            'estado'            => 'Estado',
            'fecha_adquisicion' => 'Fecha adquisición',
            'precio_unitario'   => 'Precio',
        ];

        return match ($format) {
            'pdf'   => $this->exporter->toPdf($rows, $headers, 'inventario.pdf', 'Inventario de activos'),
            default => $this->exporter->toXlsx($rows, $headers, 'inventario.xlsx', 'Inventario'),
        };
    }

    // -------------------- Bitácora --------------------

    public function bitacora(): ResponseInterface
    {
        [$desde, $hasta, $orgId] = $this->extraerFiltrosBitacora();
        $page    = (int) ($this->request->getGet('page') ?? 1);
        $perPage = min((int) ($this->request->getGet('per_page') ?? 50), 200);

        $rows = $this->movements->reporteRango($desde, $hasta, $orgId);

        // Paginación manual sobre el resultset (la query de bitácora ya filtra suficiente)
        $total = count($rows);
        $rows  = array_slice($rows, ($page - 1) * $perPage, $perPage);

        return $this->respond([
            'data' => $rows,
            'meta' => [
                'page'        => $page,
                'per_page'    => $perPage,
                'total'       => $total,
                'total_pages' => (int) ceil($total / $perPage),
                'filtros'     => ['desde' => $desde, 'hasta' => $hasta, 'organizacion_id' => $orgId],
            ],
        ]);
    }

    public function bitacoraExport(): ResponseInterface
    {
        $format = $this->request->getGet('format') ?? 'xlsx';
        [$desde, $hasta, $orgId] = $this->extraerFiltrosBitacora();

        $rows = $this->movements->reporteRango($desde, $hasta, $orgId);

        $headers = [
            'created_at'        => 'Fecha',
            'tipo'              => 'Tipo',
            'codigo_inventario' => 'Código',
            'activo_nombre'     => 'Activo',
            'campo_afectado'    => 'Campo',
            'valor_anterior'    => 'Antes',
            'valor_nuevo'       => 'Después',
            'usuario'           => 'Usuario',
            'organizacion'      => 'Organización',
            'motivo'            => 'Motivo',
        ];

        return match ($format) {
            'pdf'   => $this->exporter->toPdf($rows, $headers, 'bitacora.pdf', "Bitácora {$desde} a {$hasta}"),
            default => $this->exporter->toXlsx($rows, $headers, 'bitacora.xlsx', 'Bitácora'),
        };
    }

    // -------------------- Helpers privados --------------------

    private function extraerFiltrosInventario(): array
    {
        return [
            'organizacion_id' => $this->request->getGet('organizacion_id'),
            'departamento_id' => $this->request->getGet('departamento_id'),
            'estado_id'       => $this->request->getGet('estado_id'),
            'resguardante_id' => $this->request->getGet('resguardante_id'),
            'busqueda'        => $this->request->getGet('q'),
        ];
    }

    private function extraerFiltrosBitacora(): array
    {
        return [
            $this->request->getGet('desde') ?: date('Y-m-01 00:00:00'),
            $this->request->getGet('hasta') ?: date('Y-m-d 23:59:59'),
            $this->request->getGet('organizacion_id') ? (int) $this->request->getGet('organizacion_id') : null,
        ];
    }

    private function queryInventario(array $f)
    {
        $b = $this->assets
            ->select([
                'assets.id',
                'assets.codigo_inventario',
                'assets.serial_interno',
                'assets.nombre',
                'assets.marca',
                'assets.modelo',
                'assets.precio_unitario',
                'assets.fecha_adquisicion',
                'org.nombre AS organizacion',
                'dep.nombre AS departamento',
                'r.nombre_completo AS resguardante',
                's.nombre AS estado',
            ])
            ->join('organizations org',  'org.id = assets.organizacion_id', 'left')
            ->join('departments dep',    'dep.id = assets.departamento_id', 'left')
            ->join('resguardantes r',    'r.id = assets.resguardante_id',   'left')
            ->join('asset_statuses s',   's.id = assets.estado_id',         'left');

        if (! empty($f['organizacion_id'])) $b->where('assets.organizacion_id', $f['organizacion_id']);
        if (! empty($f['departamento_id'])) $b->where('assets.departamento_id', $f['departamento_id']);
        if (! empty($f['estado_id']))       $b->where('assets.estado_id',       $f['estado_id']);
        if (! empty($f['resguardante_id'])) $b->where('assets.resguardante_id', $f['resguardante_id']);

        if (! empty($f['busqueda'])) {
            $b->groupStart()
              ->like('assets.codigo_inventario', $f['busqueda'])
              ->orLike('assets.serial_interno',  $f['busqueda'])
              ->orLike('assets.nombre',          $f['busqueda'])
              ->groupEnd();
        }

        return $b->orderBy('assets.codigo_inventario', 'ASC');
    }
}
