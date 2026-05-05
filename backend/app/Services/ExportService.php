<?php

namespace App\Services;

use CodeIgniter\HTTP\ResponseInterface;

/**
 * Exporta datos a XLSX (CSV compatible) o PDF básico HTML.
 * Para XLSX real instalar: composer require phpoffice/phpspreadsheet
 */
class ExportService
{
    /**
     * Exporta a XLSX (CSV con extensión .xlsx para compatibilidad básica).
     */
    public function toXlsx(array $rows, array $headers, string $filename, string $title = ''): ResponseInterface
    {
        $output = '';

        // Fila de encabezados
        $output .= implode(',', array_map(fn($h) => '"' . str_replace('"', '""', $h) . '"', $headers)) . "\n";

        // Filas de datos
        foreach ($rows as $row) {
            $cells = [];
            foreach (array_keys($headers) as $campo) {
                $val     = $row[$campo] ?? '';
                $cells[] = '"' . str_replace('"', '""', (string) $val) . '"';
            }
            $output .= implode(',', $cells) . "\n";
        }

        return service('response')
            ->setHeader('Content-Type', 'application/vnd.ms-excel; charset=UTF-8')
            ->setHeader('Content-Disposition', "attachment; filename=\"{$filename}\"")
            ->setBody("\xEF\xBB\xBF" . $output); // BOM UTF-8
    }

    /**
     * Exporta a PDF (HTML básico con estilos de impresión).
     * Para PDF real instalar: composer require dompdf/dompdf
     */
    public function toPdf(array $rows, array $headers, string $filename, string $title = ''): ResponseInterface
    {
        $th = '';
        foreach ($headers as $h) {
            $th .= '<th>' . htmlspecialchars($h) . '</th>';
        }

        $tbody = '';
        foreach ($rows as $row) {
            $tbody .= '<tr>';
            foreach (array_keys($headers) as $campo) {
                $tbody .= '<td>' . htmlspecialchars((string) ($row[$campo] ?? '')) . '</td>';
            }
            $tbody .= '</tr>';
        }

        $html = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>{$title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 10pt; }
    h1   { font-size: 14pt; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>{$title}</h1>
  <table>
    <thead><tr>{$th}</tr></thead>
    <tbody>{$tbody}</tbody>
  </table>
</body>
</html>
HTML;

        return service('response')
            ->setHeader('Content-Type', 'text/html; charset=UTF-8')
            ->setHeader('Content-Disposition', "attachment; filename=\"{$filename}\"")
            ->setBody($html);
    }
}
