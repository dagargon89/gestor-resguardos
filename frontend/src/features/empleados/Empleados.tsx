import { useEffect, useState, useDeferredValue, useTransition } from 'react';
import { request } from '@/lib/apiClient';
import { Search, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Empleado {
  id: number;
  numero_empleado: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo: string;
  puesto: string;
  departamento: string;
  organizacion: string;
  email: string;
  activo: number;
}

interface Meta { page: number; per_page: number; total: number; total_pages: number; }

export default function Empleados() {
  const [rows, setRows]     = useState<Empleado[]>([]);
  const [meta, setMeta]     = useState<Meta | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const deferredSearch      = useDeferredValue(search);

  function fetchData(p = 1, q = '') {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), per_page: '50' });
    if (q) params.set('q', q);
    request<{ data: Empleado[]; meta: Meta }>(`/empleados?${params}`)
      .then(res => { setRows(res.data); setMeta(res.meta); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(page, deferredSearch); }, [page, deferredSearch]);

  function handleSearch(v: string) {
    setSearch(v);
    startTransition(() => setPage(1));
  }

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`¿Eliminar al empleado "${nombre}"?`)) return;
    await request(`/empleados/${id}`, { method: 'DELETE' });
    fetchData(page, deferredSearch);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
        <Link to="/empleados/nuevo" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nuevo empleado
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar por nombre o número…"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">N° Emp.</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Puesto</th>
                <th className="px-4 py-3">Departamento</th>
                <th className="px-4 py-3">Organización</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Cargando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Sin resultados</td></tr>
              ) : rows.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{e.numero_empleado || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{e.nombre_completo}</td>
                  <td className="px-4 py-3 text-gray-500">{e.puesto || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{e.departamento || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{e.organizacion || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {e.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/empleados/${e.id}`} className="text-gray-400 hover:text-blue-600"><Eye size={16} /></Link>
                      <Link to={`/empleados/${e.id}/editar`} className="text-gray-400 hover:text-yellow-600"><Pencil size={16} /></Link>
                      <button onClick={() => handleDelete(e.id, e.nombre_completo)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{meta.total.toLocaleString()} empleados</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Anterior</button>
              <span className="px-3 py-1">{page} / {meta.total_pages}</span>
              <button disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
