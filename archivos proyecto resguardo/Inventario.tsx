// frontend/src/features/inventario/Inventario.tsx

import { useEffect, useState, useTransition, useDeferredValue, useCallback } from 'react';
import { Search, Download, FileText, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/apiClient';

interface InventarioRow {
  id: number;
  codigo_inventario:  string;
  serial_interno:     string;
  nombre:             string;
  marca:              string | null;
  modelo:             string | null;
  organizacion:       string | null;
  departamento:       string | null;
  resguardante:       string | null;
  estado:             string | null;
  precio_unitario:    string | null;
  fecha_adquisicion:  string | null;
}

interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export default function Inventario() {
  const [search, setSearch]               = useState('');
  const [page, setPage]                   = useState(1);
  const [rows, setRows]                   = useState<InventarioRow[]>([]);
  const [pagination, setPagination]       = useState<Pagination | null>(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [isPending, startTransition]      = useTransition();

  // useDeferredValue → la búsqueda no bloquea el input mientras se filtra
  const deferredSearch = useDeferredValue(search);

  const fetchData = useCallback((signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    return api.request<InventarioRow[]>('/reports/inventario', {
      query:  { q: deferredSearch || null, page, per_page: 25 },
      signal,
    })
      .then(res => {
        setRows(res.data);
        setPagination(res.meta as unknown as Pagination);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [deferredSearch, page]);

  useEffect(() => {
    const ac = new AbortController();
    fetchData(ac.signal);
    return () => ac.abort();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    startTransition(() => {
      setSearch(value);
      setPage(1);
    });
  };

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    const ext      = format === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `inventario.${ext}`;
    try {
      await api.download('/reports/inventario/export', filename, {
        format,
        q: deferredSearch || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
          <p className="text-sm text-slate-500">
            {pagination ? `${pagination.total.toLocaleString('es-MX')} activos` : '—'}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => handleExport('xlsx')} className="btn-secondary">
            <Download size={16} /> Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="btn-secondary">
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="card">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar por código, serial o nombre..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="input pl-10"
          />
          {isPending && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* Tabla */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>Código</Th>
                <Th>Serial</Th>
                <Th>Nombre</Th>
                <Th>Resguardante</Th>
                <Th>Departamento</Th>
                <Th>Estado</Th>
                <Th align="right">Precio</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading && rows.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="mx-auto size-6 animate-spin text-slate-400" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-500">Sin resultados</td></tr>
              ) : rows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <Td className="font-mono text-xs">{row.codigo_inventario}</Td>
                  <Td className="font-mono text-xs">{row.serial_interno}</Td>
                  <Td className="font-medium text-slate-900">{row.nombre}</Td>
                  <Td>{row.resguardante ?? '—'}</Td>
                  <Td>{row.departamento ?? '—'}</Td>
                  <Td><EstadoBadge estado={row.estado} /></Td>
                  <Td align="right" className="font-mono">
                    {row.precio_unitario ? `$${Number(row.precio_unitario).toLocaleString('es-MX')}` : '—'}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-600">
              Página {pagination.page} de {pagination.total_pages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                disabled={pagination.page >= pagination.total_pages || isLoading}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ----- helpers de tabla -----

interface CellProps {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

function Th({ children, align = 'left' }: CellProps) {
  return (
    <th className={`px-4 py-3 font-semibold text-slate-700 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function Td({ children, align = 'left', className = '' }: CellProps) {
  return (
    <td className={`px-4 py-3 ${align === 'right' ? 'text-right' : ''} ${className}`}>
      {children}
    </td>
  );
}

function EstadoBadge({ estado }: { estado: string | null }) {
  if (!estado) return <span className="text-slate-400">—</span>;

  const colors: Record<string, string> = {
    'Activo':         'bg-emerald-100 text-emerald-700',
    'En reparación':  'bg-amber-100   text-amber-700',
    'En almacén':     'bg-sky-100     text-sky-700',
    'Dado de baja':   'bg-slate-200   text-slate-600',
    'Extraviado':     'bg-red-100     text-red-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[estado] ?? 'bg-slate-100 text-slate-700'}`}>
      {estado}
    </span>
  );
}
