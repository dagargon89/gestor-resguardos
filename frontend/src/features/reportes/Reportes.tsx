import { useEffect, useState } from 'react';
import { request, download } from '@/lib/apiClient';
import { FileSpreadsheet, FileText, Search } from 'lucide-react';

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

interface Meta { page: number; per_page: number; total: number; total_pages: number; }

export default function Reportes() {
  const [rows, setRows]     = useState<BitacoraRow[]>([]);
  const [meta, setMeta]     = useState<Meta | null>(null);
  const [desde, setDesde]   = useState(() => new Date().toISOString().slice(0, 8) + '01');
  const [hasta, setHasta]   = useState(() => new Date().toISOString().slice(0, 10));
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);

  function fetchData(p = 1) {
    setLoading(true);
    const params = new URLSearchParams({ desde, hasta, page: String(p), per_page: '50' });
    request<{ data: BitacoraRow[]; meta: Meta }>(`/reports/bitacora?${params}`)
      .then(res => { setRows(res.data); setMeta(res.meta); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(page); }, [page, desde, hasta]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Bitácora de movimientos</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => { setDesde(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => { setHasta(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex-1" />
        <button onClick={() => download('/reports/bitacora/export', 'bitacora.xlsx', { desde, hasta, format: 'xlsx' })}
          className="flex items-center gap-2 border border-gray-300 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
          <FileSpreadsheet size={16} /> Excel
        </button>
        <button onClick={() => download('/reports/bitacora/export', 'bitacora.pdf', { desde, hasta, format: 'pdf' })}
          className="flex items-center gap-2 border border-gray-300 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
          <FileText size={16} /> PDF
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Bien</th>
                <th className="px-4 py-3">Campo</th>
                <th className="px-4 py-3">Antes</th>
                <th className="px-4 py-3">Después</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">Cargando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">Sin movimientos en el período</td></tr>
              ) : rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 text-xs">
                  <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{r.created_at?.slice(0, 16)}</td>
                  <td className="px-4 py-2"><span className="px-2 py-0.5 bg-gray-100 rounded font-medium">{r.tipo}</span></td>
                  <td className="px-4 py-2 font-mono text-gray-600">{r.codigo_interno}</td>
                  <td className="px-4 py-2 max-w-32 truncate text-gray-800">{r.activo_nombre}</td>
                  <td className="px-4 py-2 text-gray-500">{r.campo_afectado || '—'}</td>
                  <td className="px-4 py-2 text-gray-500 max-w-24 truncate">{r.valor_anterior || '—'}</td>
                  <td className="px-4 py-2 text-gray-500 max-w-24 truncate">{r.valor_nuevo || '—'}</td>
                  <td className="px-4 py-2 text-gray-500">{r.usuario || '—'}</td>
                  <td className="px-4 py-2 text-gray-500 max-w-32 truncate">{r.motivo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{meta.total.toLocaleString()} registros</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Anterior</button>
              <span>{page} / {meta.total_pages}</span>
              <button disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
