import { useEffect, useState } from 'react';
import { request } from '@/lib/apiClient';
import { Plus, Eye, FileText, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Asignacion {
  id: number;
  folio: string;
  tipo: 'resguardo' | 'prestamo';
  estado: string;
  empleado_nombre: string;
  organizacion: string;
  inicio: string;
  fin_prevista: string | null;
  bienes: { nombre: string }[];
}

interface Meta { page: number; per_page: number; total: number; total_pages: number; }

const estadoColors: Record<string, string> = {
  activa:      'bg-green-100 text-green-700',
  borrador:    'bg-yellow-100 text-yellow-700',
  devuelta:    'bg-gray-100 text-gray-600',
  transferida: 'bg-blue-100 text-blue-700',
  cancelada:   'bg-red-100 text-red-700',
};

export default function Asignaciones() {
  const [rows, setRows]     = useState<Asignacion[]>([]);
  const [meta, setMeta]     = useState<Meta | null>(null);
  const [tipo, setTipo]     = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function fetchData(p = 1) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), per_page: '50' });
    if (tipo)   params.set('tipo', tipo);
    if (estado) params.set('estado', estado);
    request<{ data: Asignacion[]; meta: Meta }>(`/asignaciones?${params}`)
      .then(res => { setRows(res.data); setMeta(res.meta); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(page); }, [page, tipo, estado]);

  async function handleDevolver(id: number, folio: string) {
    if (!confirm(`¿Registrar devolución de la asignación ${folio}?`)) return;
    await request(`/asignaciones/${id}/devolver`, { method: 'POST', body: '{}' });
    fetchData(page);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
        <Link to="/asignaciones/nueva" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nueva asignación
        </Link>
      </div>

      <div className="flex gap-3">
        <select value={tipo} onChange={e => { setTipo(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los tipos</option>
          <option value="resguardo">Resguardo</option>
          <option value="prestamo">Préstamo</option>
        </select>
        <select value={estado} onChange={e => { setEstado(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="activa">Activa</option>
          <option value="devuelta">Devuelta</option>
          <option value="transferida">Transferida</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">Bienes</th>
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3">Fin prevista</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Cargando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Sin asignaciones</td></tr>
              ) : rows.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{a.folio}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.tipo === 'resguardo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {a.tipo === 'resguardo' ? 'Resguardo' : 'Préstamo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{a.empleado_nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{a.bienes?.length ?? 0} bien(es)</td>
                  <td className="px-4 py-3 text-gray-500">{a.inicio}</td>
                  <td className="px-4 py-3 text-gray-500">{a.fin_prevista ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[a.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {a.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/asignaciones/${a.id}`} className="text-gray-400 hover:text-blue-600"><Eye size={16} /></Link>
                      <Link to={`/asignaciones/${a.id}/carta`} className="text-gray-400 hover:text-green-600"><FileText size={16} /></Link>
                      {a.estado === 'activa' && (
                        <button onClick={() => handleDevolver(a.id, a.folio)} className="text-gray-400 hover:text-orange-600">
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{meta.total.toLocaleString()} asignaciones</span>
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
