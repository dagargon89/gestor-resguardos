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

interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export default function Empleados() {
  const [rows, setRows] = useState<Empleado[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  function fetchData(p = 1, q = '') {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), per_page: '50' });
    if (q) params.set('q', q);
    request<{ data: Empleado[]; meta: Meta }>(`/empleados?${params}`)
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData(page, deferredSearch);
  }, [page, deferredSearch]);

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
      <div className="page-head">
        <div className="page-title">
          <span className="eyebrow">Personas</span>
          <h1>Empleados</h1>
          <span className="sub">Directorio y datos laborales</span>
        </div>
        <div className="page-actions">
          <Link to="/empleados/nuevo" className="btn btn-primary">
            <Plus size={14} strokeWidth={1.75} /> Nuevo empleado
          </Link>
        </div>
      </div>

      <div className="toolbar">
        <div className="field-wrap max-w-sm flex-1">
          <Search size={16} className="ico-left" strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Nombre o número de empleado…"
            className="input input-search"
          />
        </div>
      </div>

      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>N° Emp.</th>
                <th>Nombre</th>
                <th>Puesto</th>
                <th>Departamento</th>
                <th>Organización</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="dim text-center py-10">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="dim text-center py-10">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                rows.map((e) => (
                  <tr key={e.id}>
                    <td className="mono text-xs">{e.numero_empleado || '—'}</td>
                    <td>{e.nombre_completo}</td>
                    <td className="muted">{e.puesto || '—'}</td>
                    <td className="muted">{e.departamento || '—'}</td>
                    <td className="muted">{e.organizacion || '—'}</td>
                    <td>
                      <span className={`chip ${e.activo ? 'ok' : ''}`}>
                        <span className="chip-dot" />
                        {e.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="row justify-end gap-2">
                        <Link to={`/empleados/${e.id}/editar`} className="icon-action">
                          <Eye size={16} strokeWidth={1.75} />
                        </Link>
                        <Link to={`/empleados/${e.id}/editar`} className="icon-action icon-action--warn">
                          <Pencil size={16} strokeWidth={1.75} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(e.id, e.nombre_completo)}
                          className="icon-action icon-action--danger"
                        >
                          <Trash2 size={16} strokeWidth={1.75} />
                        </button>
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
            <span>{meta.total.toLocaleString()} empleados</span>
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
