import { useEffect, useState } from 'react';
import { request } from '@/lib/apiClient';
import { Plus, FileText, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

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

interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

const estadoChip: Record<string, string> = {
  activa: 'accent',
  borrador: 'warn',
  devuelta: '',
  transferida: 'info',
  cancelada: 'danger',
};

export default function Asignaciones() {
  const [rows, setRows] = useState<Asignacion[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function fetchData(p = 1) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), per_page: '50' });
    if (tipo) params.set('tipo', tipo);
    if (estado) params.set('estado', estado);
    request<{ data: Asignacion[]; meta: Meta }>(`/asignaciones?${params}`)
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData(page);
  }, [page, tipo, estado]);

  async function handleDevolver(id: number, folio: string) {
    if (!confirm(`¿Registrar devolución de la asignación ${folio}?`)) return;
    await request(`/asignaciones/${id}/devolver`, { method: 'POST', body: '{}' });
    fetchData(page);
  }

  return (
    <div className="space-y-4">
      <div className="page-head">
        <div className="page-title">
          <span className="eyebrow">Inventario</span>
          <h1>Asignaciones</h1>
          <span className="sub">Resguardos y préstamos</span>
        </div>
        <div className="page-actions">
          <Link to="/asignaciones/nueva" className="btn btn-primary">
            <Plus size={14} strokeWidth={1.75} /> Nueva asignación
          </Link>
        </div>
      </div>

      <div className="toolbar">
        <select
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setPage(1);
          }}
          className="field-select w-full max-w-[220px]"
        >
          <option value="">Todos los tipos</option>
          <option value="resguardo">Resguardo</option>
          <option value="prestamo">Préstamo</option>
        </select>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setPage(1);
          }}
          className="field-select w-full max-w-[220px]"
        >
          <option value="">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="activa">Activa</option>
          <option value="devuelta">Devuelta</option>
          <option value="transferida">Transferida</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Tipo</th>
                <th>Responsable</th>
                <th>Bienes</th>
                <th>Inicio</th>
                <th>Fin prevista</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="dim text-center py-10">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="dim text-center py-10">
                    Sin asignaciones
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id}>
                    <td className="mono text-xs font-semibold">
                      <span className="linkish">{a.folio}</span>
                    </td>
                    <td>
                      <span className={`chip ${a.tipo === 'resguardo' ? 'info' : 'accent'}`}>
                        <span className="chip-dot" />
                        {a.tipo === 'resguardo' ? 'Resguardo' : 'Préstamo'}
                      </span>
                    </td>
                    <td>{a.empleado_nombre}</td>
                    <td className="muted">{a.bienes?.length ?? 0} bien(es)</td>
                    <td className="muted tnum">{a.inicio}</td>
                    <td className="muted tnum">{a.fin_prevista ?? '—'}</td>
                    <td>
                      <span className={`chip ${estadoChip[a.estado] ?? ''}`}>
                        <span className="chip-dot" />
                        {a.estado}
                      </span>
                    </td>
                    <td>
                      <div className="row justify-end gap-2">
                        <Link to={`/asignaciones/${a.id}/carta`} className="icon-action" title="Carta">
                          <FileText size={16} strokeWidth={1.75} />
                        </Link>
                        {a.estado === 'activa' && (
                          <button
                            type="button"
                            onClick={() => handleDevolver(a.id, a.folio)}
                            className="icon-action icon-action--warn"
                            title="Registrar devolución"
                          >
                            <RotateCcw size={16} strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                    </td>
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
            <span>{meta.total.toLocaleString()} asignaciones</span>
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
