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

const chipMap: Record<string, string> = {
  green: 'ok',
  blue: 'info',
  red: 'danger',
  yellow: 'warn',
  orange: 'warn',
  purple: 'info',
};

export default function Bienes() {
  const [rows, setRows] = useState<Bien[]>([]);
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

    request<{ data: Bien[]; meta: Meta }>(`/bienes?${params}`)
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
    if (!confirm(`¿Dar de baja el bien "${nombre}"?`)) return;
    await request(`/bienes/${id}`, { method: 'DELETE' });
    fetchData(page, deferredSearch);
  }

  return (
    <div className="space-y-4">
      <div className="page-head">
        <div className="page-title">
          <span className="eyebrow">Inventario</span>
          <h1>Bienes</h1>
          <span className="sub">Catálogo de activos</span>
        </div>
        <div className="page-actions">
          <Link to="/bienes/nuevo" className="btn btn-primary">
            <Plus size={14} strokeWidth={1.75} /> Nuevo bien
          </Link>
        </div>
      </div>

      <div className="toolbar">
        <div className="field-wrap max-w-sm flex-1">
          <Search size={16} className="ico-left" strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Código, nombre, serie…"
            className="input input-search"
          />
        </div>
        <button
          type="button"
          onClick={() => download('/reports/inventario/export', 'inventario.xlsx', { format: 'xlsx' })}
          className="btn"
        >
          <FileSpreadsheet size={14} strokeWidth={1.75} /> Excel
        </button>
        <button
          type="button"
          onClick={() => download('/reports/inventario/export', 'inventario.pdf', { format: 'pdf' })}
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
                <th>Código</th>
                <th>Nombre</th>
                <th>Marca/Modelo</th>
                <th>N° Serie</th>
                <th>Organización</th>
                <th>Estado</th>
                <th className="col-num">Precio</th>
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
                    Sin resultados
                  </td>
                </tr>
              ) : (
                rows.map((b) => (
                  <tr key={b.id}>
                    <td className="mono">
                      <Link to={`/bienes/${b.id}/editar`} className="linkish gr-code !font-semibold">
                        {b.codigo_interno}
                      </Link>
                    </td>
                    <td className="max-w-[12rem] truncate">{b.nombre}</td>
                    <td className="muted">{[b.marca, b.modelo].filter(Boolean).join(' / ')}</td>
                    <td className="mono muted text-xs">{b.numero_serie || '—'}</td>
                    <td className="muted">{b.organizacion || '—'}</td>
                    <td>
                      <span
                        className={`chip ${chipMap[b.estado_color] ? chipMap[b.estado_color] : ''}`}
                      >
                        <span className="chip-dot" />
                        {b.estado}
                      </span>
                    </td>
                    <td className="col-num muted">
                      {b.precio_unitario ? `$${Number(b.precio_unitario).toLocaleString('es-MX')}` : '—'}
                    </td>
                    <td>
                      <div className="row justify-end gap-2">
                        <Link to={`/bienes/${b.id}/editar`} className="icon-action">
                          <Eye size={16} strokeWidth={1.75} />
                        </Link>
                        <Link to={`/bienes/${b.id}/editar`} className="icon-action icon-action--warn">
                          <Pencil size={16} strokeWidth={1.75} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id, b.nombre)}
                          className="icon-action icon-action--danger"
                          title="Dar de baja"
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
            <span>{meta.total.toLocaleString()} bienes</span>
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
