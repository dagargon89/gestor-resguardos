<?php

namespace App\Controllers\Api\V1;

use App\Controllers\BaseController;
use App\Models\AsignacionModel;
use App\Services\CartaService;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\ResponseInterface;

class Cartas extends BaseController
{
    use ResponseTrait;

    private AsignacionModel $model;
    private CartaService    $cartaService;

    public function __construct()
    {
        $this->model        = model(AsignacionModel::class);
        $this->cartaService = new CartaService();
    }

    /**
     * GET /api/v1/cartas/{id}/html
     * Devuelve el HTML de la carta para impresión desde el navegador.
     */
    public function html(int $id): ResponseInterface
    {
        try {
            $html = $this->cartaService->generarHtml($id);
        } catch (\RuntimeException $e) {
            return $this->failNotFound($e->getMessage());
        }

        return $this->respond(['data' => ['html' => base64_encode($html)]]);
    }

    /**
     * POST /api/v1/cartas/{id}/generar
     * Genera el PDF (usando HTML→PDF) y lo registra en documentos_generados.
     * Devuelve el ID del documento generado.
     */
    public function generar(int $id): ResponseInterface
    {
        $asignacion = $this->model->find($id);
        if (! $asignacion) return $this->failNotFound('Asignación no encontrada');

        try {
            $html = $this->cartaService->generarHtml($id);
        } catch (\RuntimeException $e) {
            return $this->failNotFound($e->getMessage());
        }

        // Guardar HTML como archivo (PDF requiere Dompdf/mPDF que se instalaría por separado)
        $dir     = FCPATH . 'uploads/cartas/';
        if (! is_dir($dir)) mkdir($dir, 0755, true);
        $nombre  = "carta_{$asignacion['folio']}_" . date('YmdHis') . '.html';
        $ruta    = 'uploads/cartas/' . $nombre;
        file_put_contents(FCPATH . $ruta, $html);
        $hash    = hash_file('sha256', FCPATH . $ruta);

        $docId = db_connect()->table('documentos_generados')->insert([
            'asignacion_id'  => $id,
            'tipo_plantilla' => $asignacion['tipo'],
            'version'        => '1.0',
            'ruta'           => $ruta,
            'hash_sha256'    => $hash,
            'generado_por'   => auth()->id(),
            'generado_en'    => date('Y-m-d H:i:s'),
            'created_at'     => date('Y-m-d H:i:s'),
        ], true);

        return $this->respondCreated([
            'data' => [
                'documento_id' => db_connect()->insertID(),
                'folio'        => $asignacion['folio'],
                'hash'         => $hash,
            ],
        ]);
    }

    /**
     * GET /api/v1/cartas/documento/{docId}
     * Descarga el archivo de la carta.
     */
    public function descargar(int $docId): ResponseInterface
    {
        $doc = db_connect()->table('documentos_generados')->find($docId);
        if (! $doc) return $this->failNotFound('Documento no encontrado');

        $path = FCPATH . $doc['ruta'];
        if (! file_exists($path)) return $this->failNotFound('Archivo no encontrado en el servidor');

        return $this->response
            ->setHeader('Content-Disposition', 'attachment; filename="' . basename($path) . '"')
            ->setContentType('text/html')
            ->setBody(file_get_contents($path));
    }
}
