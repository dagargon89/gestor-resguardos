import { useEffect, useState } from 'react';
import { request, download } from '@/lib/apiClient';
import { FileSpreadsheet, FileText } from 'lucide-react';

interface BitacoraRow {
  created_at: string;
  tipo: string;
  codigo_interno: string;
  activo_nombre: string;
  campo_afectado: string;
  valor_anterior: string;
  valor_nuevo: string;
  usuario: string;
  organizacion: string;
  motivo: string;
}

interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export default function Reportes() {
  const [rows, setRows] = useState<BitacoraRow[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [desde, setDesde] = useState(() => new Date().toISOString().slice(0, 8) + '01');
  const [hasta, setHasta] = useState(() => new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function fetchData(p = 1) {
    setLoading(true);
    const params = new URLSearchParams({ desde, hasta, page: String(p), per_page: '50' });
    request<{ data: BitacoraRow[]; meta: Meta }>(`/reports/bitacora?${params}`)
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData(page);
  }, [page, desde, hasta]);

  return (
    <div className="space-y-4">
      <div className="page-head">
        <div className="page-title">
          <span className="eyebrow">Análisis</span>
          <h1>Bitácora de movimientos</h1>
          <span className="sub">Historial auditable por rango de fechas</span>
        </div>
      </div>

      <div className="toolbar">
        <label className="field max-w-[200px] mb-0">
          <span>Desde</span>
          <input
            type="date"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              setPage(1);
            }}
            className="input"
          />
        </label>
        <label className="field max-w-[200px] mb-0">
          <span>Hasta</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value);
              setPage(1);
            }}
            className="input"
          />
        </label>
        <div className="spacer hidden sm:block" />
        <button
          type="button"
          onClick={() =>
            download('/reports/bitacora/export', 'bitacora.xlsx', {
              desde,
              hasta,
              format: 'xlsx',
            })
          }
          className="btn"
        >
          <FileSpreadsheet size={14} strokeWidth={1.75} /> Excel
        </button>
        <button
          type="button"
          onClick={() =>
            download('/reports/bitacora/export', 'bitacora.pdf', {
              desde,
              hasta,
              format: 'pdf',
            })
          }
          className="btn"
        >
          <FileText size={14} strokeWidth={1.75} /> PDF
        </button>
      </div>

      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Código</th>
                <th>Bien</th>
                <th>Campo</th>
                <th>Antes</th>
                <th>Después</th>
                <th>Usuario</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="dim text-center py-10">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="dim text-center py-10">
                    Sin movimientos en el período
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={`${r.created_at}-${i}`}>
                    <td className="muted tnum text-xs whitespace-nowrap">{r.created_at?.slice(0, 16)}</td>
                    <td>
                      <span className="tag">{r.tipo}</span>
                    </td>
                    <td className="mono muted text-xs">{r.codigo_interno}</td>
                    <td className="max-w-[8rem] truncate">{r.activo_nombre}</td>
                    <td className="muted text-xs">{r.campo_afectado || '—'}</td>
                    <td className="muted max-w-[6rem] truncate text-xs">{r.valor_anterior || '—'}</td>
                    <td className="muted max-w-[6rem] truncate text-xs">{r.valor_nuevo || '—'}</td>
                    <td className="muted text-xs">{r.usuario || '—'}</td>
                    <td className="muted max-w-[8rem] truncate text-xs">{r.motivo || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {meta && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm muted border-t"
            style={{ borderColor: 'var(--line-1)' }}
          >
            <span>{meta.total.toLocaleString()} registros</span>
            <div className="pager">
              <button
                type="button"
                disabled={page <= 1}
                className="pg-btn disabled:opacity-40"
                onClick={() => setPage((p) => p - 1)}
              >
                ‹
              </button>
              <span className="pg-btn active border-[var(--line-2)]">{page}</span>
              <span className="text-xs">/ {meta.total_pages}</span>
              <button
                type="button"
                disabled={page >= meta.total_pages}
                className="pg-btn disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
