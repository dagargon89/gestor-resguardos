import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '@/lib/apiClient';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';

interface Empleado {
  id: number;
  nombre_completo: string;
}
interface Bien {
  id: number;
  codigo_interno: string;
  nombre: string;
  estado: string;
}
interface BienLinea {
  bien_id: number;
  codigo_interno: string;
  nombre: string;
  cantidad: number;
  notas: string;
}

export default function AsignacionForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tipo: 'resguardo',
    empleado_responsable_id: '',
    inicio: new Date().toISOString().slice(0, 10),
    fin_prevista: '',
    observaciones: '',
  });

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [bienesDisp, setBienesDisp] = useState<Bien[]>([]);
  const [lineas, setLineas] = useState<BienLinea[]>([]);
  const [bienSearch, setBienSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    request<{ data: Empleado[] }>('/empleados?per_page=200&activo=1').then((r) => setEmpleados(r.data));
  }, []);

  useEffect(() => {
    if (!bienSearch) {
      setBienesDisp([]);
      return;
    }
    request<{ data: Bien[] }>(`/bienes?q=${encodeURIComponent(bienSearch)}&estado_bien_id=1&per_page=20`).then((r) =>
      setBienesDisp(r.data),
    );
  }, [bienSearch]);

  function agregarBien(bien: Bien) {
    if (lineas.find((l) => l.bien_id === bien.id)) return;
    setLineas((prev) => [
      ...prev,
      {
        bien_id: bien.id,
        codigo_interno: bien.codigo_interno,
        nombre: bien.nombre,
        cantidad: 1,
        notas: '',
      },
    ]);
    setBienSearch('');
    setBienesDisp([]);
  }

  function quitarBien(id: number) {
    setLineas((prev) => prev.filter((l) => l.bien_id !== id));
  }

  function setLinea(id: number, campo: 'cantidad' | 'notas', valor: string | number) {
    setLineas((prev) => prev.map((l) => (l.bien_id === id ? { ...l, [campo]: valor } : l)));
  }

  const set =
    (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lineas.length === 0) {
      setError('Debe agregar al menos un bien');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await request('/asignaciones', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          empleado_responsable_id: Number(form.empleado_responsable_id),
          bienes: lineas.map((l) => ({
            bien_id: l.bien_id,
            cantidad: l.cantidad,
            notas: l.notas,
          })),
        }),
      });
      navigate('/asignaciones');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="page-head">
        <div className="page-title">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm -ml-1 mb-2 w-fit"
          >
            <ArrowLeft size={16} strokeWidth={1.75} /> Volver
          </button>
          <span className="eyebrow">Inventario</span>
          <h1>Nueva asignación</h1>
        </div>
      </div>

      {error && (
        <div
          className="rounded-[var(--r-md)] px-4 py-3 text-sm"
          style={{
            background: 'var(--danger-soft)',
            color: 'var(--danger)',
            border: '1px solid rgba(239,111,111,0.28)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card card-pad space-y-4">
          <h2 className="section-title mb-2">Datos generales</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="field">
              <span>
                Tipo <span className="req">*</span>
              </span>
              <select value={form.tipo} onChange={set('tipo')} required className="field-select w-full">
                <option value="resguardo">Resguardo</option>
                <option value="prestamo">Préstamo</option>
              </select>
            </label>
            <label className="field">
              <span>
                Empleado responsable <span className="req">*</span>
              </span>
              <select
                value={form.empleado_responsable_id}
                onChange={set('empleado_responsable_id')}
                required
                className="field-select w-full"
              >
                <option value="">— Seleccionar —</option>
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre_completo}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>
                Fecha inicio <span className="req">*</span>
              </span>
              <input type="date" value={form.inicio} onChange={set('inicio')} required className="input" />
            </label>
            <label className="field">
              <span>
                Fecha fin prevista{' '}
                {form.tipo === 'prestamo' ? <span className="req">*</span> : <span className="dim">(opcional)</span>}
              </span>
              <input
                type="date"
                value={form.fin_prevista}
                onChange={set('fin_prevista')}
                required={form.tipo === 'prestamo'}
                className="input"
              />
            </label>
          </div>
          <label className="field">
            <span>Observaciones</span>
            <textarea
              value={form.observaciones}
              onChange={set('observaciones')}
              rows={2}
              className="input"
              style={{ minHeight: 64, paddingTop: 10, resize: 'vertical' }}
            />
          </label>
        </div>

        <div className="card card-pad space-y-4">
          <h2 className="section-title mb-2">Bienes asignados</h2>

          <div className="relative">
            <input
              value={bienSearch}
              onChange={(e) => setBienSearch(e.target.value)}
              placeholder="Buscar bien disponible por código o nombre…"
              className="input"
            />
            {bienesDisp.length > 0 && (
              <div
                className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-[var(--r-md)] border p-1 shadow-[var(--shadow-2)]"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--line-1)' }}
              >
                {bienesDisp.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => agregarBien(b)}
                    className="flex w-full items-center gap-2 rounded-[var(--r-sm)] px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-3)]"
                  >
                    <Plus size={14} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
                    <span className="mono w-24 shrink-0 text-xs muted">{b.codigo_interno}</span>
                    <span className="truncate">{b.nombre}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {lineas.length === 0 ? (
            <p className="dim text-sm italic">Ningún bien agregado aún</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th className="col-num">Cant.</th>
                    <th>Notas</th>
                    <th aria-label="Quitar" />
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((l) => (
                    <tr key={l.bien_id}>
                      <td className="mono text-xs">{l.codigo_interno}</td>
                      <td>{l.nombre}</td>
                      <td className="col-num">
                        <input
                          type="number"
                          min={1}
                          value={l.cantidad}
                          onChange={(e) => setLinea(l.bien_id, 'cantidad', Number(e.target.value))}
                          className="input mono tnum mx-auto inline-block max-w-[4.5rem] py-1 text-center text-xs"
                          style={{ height: 34 }}
                        />
                      </td>
                      <td>
                        <input
                          value={l.notas}
                          onChange={(e) => setLinea(l.bien_id, 'notas', e.target.value)}
                          className="input py-1 text-xs"
                          style={{ height: 34 }}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => quitarBien(l.bien_id)}
                          className="icon-action icon-action--danger"
                        >
                          <X size={14} strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={14} strokeWidth={1.75} /> {saving ? 'Guardando…' : 'Crear asignación'}
          </button>
        </div>
      </form>
    </div>
  );
}
