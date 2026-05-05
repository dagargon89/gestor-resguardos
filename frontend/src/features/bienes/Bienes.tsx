import { useEffect, useState, useDeferredValue, useTransition } from 'react';
import { request, download } from '@/lib/apiClient';
import { Search, Plus, FileSpreadsheet, FileText, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Bien {
  id: number;
  codigo_interno: string;
  nombre: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  precio_unitario: number;
  moneda: string;
  organizacion: string;
  categoria: string;
  estado: string;
  estado_color: string;
  ubicacion: string;
}

interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

const colorMap: Record<string, string> = {
  green:  'bg-green-100 text-green-700',
  blue:   'bg-blue-100 text-blue-700',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
};

export default function Bienes() {
  const [rows, setRows]       = useState<Bien[]>([]);
  const [meta, setMeta]       = useState<Meta | null>(null);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [, startTransition]   = useTransition();
  const deferredSearch        = useDeferredValue(search);

  function fetchData(p = 1, q = '') {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), per_page: '50' });
    if (q) params.set('q', q);

    request<{ data: Bien[]; meta: Meta }>(`/bienes?${params}`)
      .then(res => { setRows(res.data); setMeta(res.meta); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(page, deferredSearch); }, [page, deferredSearch]);

  function handleSearch(v: string) {
    setSearch(v);
    startTransition(() => setPage(1));
  }

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`¿Dar de baja el bien "${nombre}"?`)) return;
    await request(`/bienes/${id}`, { method: 'DELETE' });
    fetchData(page, deferredSearch);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventario de bienes</h1>
        <Link to="/bienes/nuevo" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nuevo bien
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por código, nombre, serie…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={() => download('/reports/inventario/export', 'inventario.xlsx', { format: 'xlsx' })}
          className="flex items-center gap-2 border border-gray-300 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
          <FileSpreadsheet size={16} /> Excel
        </button>
        <button onClick={() => download('/reports/inventario/export', 'inventario.pdf', { format: 'pdf' })}
          className="flex items-center gap-2 border border-gray-300 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
          <FileText size={16} /> PDF
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Marca/Modelo</th>
                <th className="px-4 py-3">N° Serie</th>
                <th className="px-4 py-3">Organización</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Cargando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Sin resultados</td></tr>
              ) : rows.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{b.codigo_interno}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-48 truncate">{b.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{[b.marca, b.modelo].filter(Boolean).join(' / ')}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{b.numero_serie || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{b.organizacion || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[b.estado_color] ?? 'bg-gray-100 text-gray-600'}`}>
                      {b.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {b.precio_unitario ? `$${Number(b.precio_unitario).toLocaleString('es-MX')}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/bienes/${b.id}`} className="text-gray-400 hover:text-blue-600"><Eye size={16} /></Link>
                      <Link to={`/bienes/${b.id}/editar`} className="text-gray-400 hover:text-yellow-600"><Pencil size={16} /></Link>
                      <button onClick={() => handleDelete(b.id, b.nombre)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{meta.total.toLocaleString()} bienes</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Anterior</button>
              <span className="px-3 py-1">{page} / {meta.total_pages}</span>
              <button disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
