<?php

namespace App\Services;

use App\Models\AsignacionModel;

class CartaService
{
    private AsignacionModel $asignacionModel;

    public function __construct()
    {
        $this->asignacionModel = model(AsignacionModel::class);
    }

    /**
     * Genera el HTML de la carta responsiva para la asignación dada.
     */
    public function generarHtml(int $asignacionId): string
    {
        $asignacion = $this->asignacionModel->conRelaciones()->find($asignacionId);

        if ($asignacion === null) {
            throw new \RuntimeException('Asignación no encontrada');
        }

        $bienes = $this->asignacionModel->bienesDeAsignacion($asignacionId);

        $empresa = db_connect()->table('configuracion')->where('clave', 'empresa_nombre')->get()->getRowArray()['valor'] ?? 'La Organización';

        $plantilla = $asignacion['tipo'] === 'prestamo'
            ? $this->plantillaPrestamo($asignacion, $bienes, $empresa)
            : $this->plantillaResguardo($asignacion, $bienes, $empresa);

        return $plantilla;
    }

    private function plantillaResguardo(array $a, array $bienes, string $empresa): string
    {
        $fecha = date('d/m/Y', strtotime($a['inicio']));
        $folio = htmlspecialchars($a['folio']);
        $empleado = htmlspecialchars($a['empleado_nombre'] ?? '');
        $puesto   = htmlspecialchars($a['empleado_puesto'] ?? '');
        $org      = htmlspecialchars($a['organizacion'] ?? '');
        $dep      = htmlspecialchars($a['departamento'] ?? '');
        $rowsBienes = $this->renderBienesTabla($bienes);

        return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carta de Resguardo {$folio}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { font-family: Arial, sans-serif; font-size: 12pt; margin: 2cm; color: #333; }
    h1 { text-align: center; font-size: 16pt; margin-bottom: 0; }
    h2 { text-align: center; font-size: 13pt; color: #555; }
    .folio { text-align: right; font-weight: bold; margin-bottom: 1em; }
    .datos { margin: 1em 0; }
    .datos td { padding: 4px 8px; }
    .datos td:first-child { font-weight: bold; width: 180px; }
    table.bienes { width: 100%; border-collapse: collapse; margin: 1em 0; }
    table.bienes th, table.bienes td { border: 1px solid #ccc; padding: 6px; }
    table.bienes th { background: #f0f0f0; }
    .clausulas { margin-top: 1em; font-size: 10pt; text-align: justify; }
    .firmas { display: flex; justify-content: space-around; margin-top: 3em; }
    .firma { text-align: center; width: 40%; }
    .firma .linea { border-top: 1px solid #333; margin: 0 auto; width: 80%; margin-top: 3em; }
  </style>
</head>
<body>
  <h1>{$empresa}</h1>
  <h2>CARTA DE RESGUARDO DE BIENES</h2>
  <div class="folio">Folio: {$folio}</div>
  <table class="datos">
    <tr><td>Fecha:</td><td>{$fecha}</td></tr>
    <tr><td>Responsable:</td><td>{$empleado}</td></tr>
    <tr><td>Puesto:</td><td>{$puesto}</td></tr>
    <tr><td>Departamento:</td><td>{$dep}</td></tr>
    <tr><td>Organización:</td><td>{$org}</td></tr>
  </table>

  <p>El suscrito, en pleno uso de sus facultades, acusa recibo de los siguientes bienes bajo resguardo para su custodia y uso en el desempeño de sus funciones, comprometiéndose a devolverlos en las mismas condiciones en que los recibe, salvo el desgaste normal por uso:</p>

  <table class="bienes">
    <thead>
      <tr><th>#</th><th>Código</th><th>Descripción</th><th>Marca</th><th>Modelo</th><th>N° Serie</th><th>Cant.</th></tr>
    </thead>
    <tbody>
      {$rowsBienes}
    </tbody>
  </table>

  <div class="clausulas">
    <strong>Cláusulas:</strong>
    <ol>
      <li>El resguardante se obliga a conservar los bienes en buen estado y a utilizarlos exclusivamente para las actividades propias de su cargo.</li>
      <li>Queda prohibida la cesión, préstamo o enajenación de los bienes a terceros sin autorización escrita.</li>
      <li>En caso de pérdida, robo o daño, el resguardante deberá notificarlo de inmediato al área de inventario.</li>
      <li>Al término de la relación laboral o al cambio de adscripción, el resguardante deberá devolver los bienes en forma inmediata.</li>
    </ol>
    <p><em>El texto legal de esta carta es una plantilla orientativa. Debe ser revisado y aprobado por el área jurídico-administrativa de la organización.</em></p>
  </div>

  <div class="firmas">
    <div class="firma">
      <div class="linea"></div>
      <p>Resguardante<br>{$empleado}</p>
    </div>
    <div class="firma">
      <div class="linea"></div>
      <p>Vo.Bo. Área de Inventario</p>
    </div>
  </div>
</body>
</html>
HTML;
    }

    private function plantillaPrestamo(array $a, array $bienes, string $empresa): string
    {
        $fecha      = date('d/m/Y', strtotime($a['inicio']));
        $fechaFin   = $a['fin_prevista'] ? date('d/m/Y', strtotime($a['fin_prevista'])) : 'Sin fecha límite';
        $folio      = htmlspecialchars($a['folio']);
        $empleado   = htmlspecialchars($a['empleado_nombre'] ?? '');
        $puesto     = htmlspecialchars($a['empleado_puesto'] ?? '');
        $rowsBienes = $this->renderBienesTabla($bienes);

        return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carta de Préstamo {$folio}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { font-family: Arial, sans-serif; font-size: 12pt; margin: 2cm; color: #333; }
    h1 { text-align: center; font-size: 16pt; margin-bottom: 0; }
    h2 { text-align: center; font-size: 13pt; color: #555; }
    .folio { text-align: right; font-weight: bold; margin-bottom: 1em; }
    .datos td { padding: 4px 8px; }
    .datos td:first-child { font-weight: bold; width: 180px; }
    table.bienes { width: 100%; border-collapse: collapse; margin: 1em 0; }
    table.bienes th, table.bienes td { border: 1px solid #ccc; padding: 6px; }
    table.bienes th { background: #f0f0f0; }
    .clausulas { margin-top: 1em; font-size: 10pt; text-align: justify; }
    .firmas { display: flex; justify-content: space-around; margin-top: 3em; }
    .firma { text-align: center; width: 40%; }
    .firma .linea { border-top: 1px solid #333; margin: 0 auto; width: 80%; margin-top: 3em; }
  </style>
</head>
<body>
  <h1>{$empresa}</h1>
  <h2>VALE DE PRÉSTAMO DE EQUIPO</h2>
  <div class="folio">Folio: {$folio}</div>
  <table class="datos">
    <tr><td>Fecha de préstamo:</td><td>{$fecha}</td></tr>
    <tr><td>Fecha de devolución:</td><td>{$fechaFin}</td></tr>
    <tr><td>Solicitante:</td><td>{$empleado}</td></tr>
    <tr><td>Puesto:</td><td>{$puesto}</td></tr>
  </table>

  <p>El suscrito recibe en calidad de <strong>préstamo temporal</strong> los siguientes bienes, comprometiéndose a devolverlos en la fecha indicada y en iguales condiciones:</p>

  <table class="bienes">
    <thead>
      <tr><th>#</th><th>Código</th><th>Descripción</th><th>Marca</th><th>Modelo</th><th>N° Serie</th><th>Cant.</th></tr>
    </thead>
    <tbody>
      {$rowsBienes}
    </tbody>
  </table>

  <div class="clausulas">
    <strong>Condiciones del préstamo:</strong>
    <ol>
      <li>El préstamo es estrictamente temporal por el período señalado.</li>
      <li>El solicitante es responsable de los bienes durante la vigencia del préstamo.</li>
      <li>En caso de no devolución en el plazo acordado, se generará un aviso formal.</li>
      <li>Cualquier daño o pérdida será responsabilidad del solicitante.</li>
    </ol>
    <p><em>El texto legal de esta carta es una plantilla orientativa. Debe ser revisado y aprobado por el área jurídico-administrativa de la organización.</em></p>
  </div>

  <div class="firmas">
    <div class="firma">
      <div class="linea"></div>
      <p>Solicitante<br>{$empleado}</p>
    </div>
    <div class="firma">
      <div class="linea"></div>
      <p>Entrega — Área de Inventario</p>
    </div>
  </div>
</body>
</html>
HTML;
    }

    private function renderBienesTabla(array $bienes): string
    {
        $rows = '';
        foreach ($bienes as $i => $b) {
            $n     = $i + 1;
            $codigo= htmlspecialchars($b['codigo_interno'] ?? '');
            $nombre= htmlspecialchars($b['nombre'] ?? '');
            $marca = htmlspecialchars($b['marca'] ?? '');
            $modelo= htmlspecialchars($b['modelo'] ?? '');
            $serie = htmlspecialchars($b['numero_serie'] ?? '');
            $cant  = (int) ($b['cantidad'] ?? 1);
            $rows .= "<tr><td>{$n}</td><td>{$codigo}</td><td>{$nombre}</td><td>{$marca}</td><td>{$modelo}</td><td>{$serie}</td><td>{$cant}</td></tr>\n";
        }
        return $rows;
    }
}
