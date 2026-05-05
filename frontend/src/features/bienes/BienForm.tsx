import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { request } from '@/lib/apiClient';
import { Save, ArrowLeft } from 'lucide-react';

interface Catalogo { id: number; nombre: string; }

export default function BienForm() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEdit    = Boolean(id);

  const [form, setForm] = useState({
    codigo_interno: '', nombre: '', descripcion: '', marca: '', modelo: '',
    numero_serie: '', organizacion_id: '', categoria_id: '', estado_bien_id: '',
    ubicacion_id: '', precio_unitario: '', moneda: 'MXN', fecha_adquisicion: '',
  });
  const [orgs, setOrgs]     = useState<Catalogo[]>([]);
  const [cats, setCats]     = useState<Catalogo[]>([]);
  const [estados, setEstados] = useState<Catalogo[]>([]);
  const [ubics, setUbics]   = useState<Catalogo[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      request<{ data: Catalogo[] }>('/catalogs/organizaciones'),
      request<{ data: Catalogo[] }>('/catalogs/categorias'),
      request<{ data: Catalogo[] }>('/catalogs/estados-bien'),
      request<{ data: Catalogo[] }>('/catalogs/ubicaciones'),
    ]).then(([o, c, e, u]) => {
      setOrgs(o.data); setCats(c.data); setEstados(e.data); setUbics(u.data);
    });

    if (isEdit) {
      request<{ data: typeof form }>(`/bienes/${id}`)
        .then(res => setForm(f => ({ ...f, ...res.data })));
    }
  }, [id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await request(`/bienes/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await request('/bienes', { method: 'POST', body: JSON.stringify(form) });
      }
      navigate('/bienes');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
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
          <h1>{isEdit ? 'Editar bien' : 'Nuevo bien'}</h1>
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

      <form onSubmit={handleSubmit} className="card card-pad space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Código interno" required>
            <input
              value={form.codigo_interno}
              onChange={set('codigo_interno')}
              required
              className="input mono"
            />
          </Field>
          <Field label="Nombre" required>
            <input value={form.nombre} onChange={set('nombre')} required className="input" />
          </Field>
          <Field label="Marca">
            <input value={form.marca} onChange={set('marca')} className="input" />
          </Field>
          <Field label="Modelo">
            <input value={form.modelo} onChange={set('modelo')} className="input" />
          </Field>
          <Field label="Número de serie">
            <input value={form.numero_serie} onChange={set('numero_serie')} className="input mono" />
          </Field>
          <Field label="Precio unitario">
            <input
              type="number"
              step="0.01"
              value={form.precio_unitario}
              onChange={set('precio_unitario')}
              className="input tnum"
            />
          </Field>
          <Field label="Organización">
            <select value={form.organizacion_id} onChange={set('organizacion_id')} className="field-select w-full">
              <option value="">— Sin organización —</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Categoría">
            <select value={form.categoria_id} onChange={set('categoria_id')} className="field-select w-full">
              <option value="">— Sin categoría —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado">
            <select value={form.estado_bien_id} onChange={set('estado_bien_id')} className="field-select w-full">
              <option value="">— Sin estado —</option>
              {estados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ubicación">
            <select value={form.ubicacion_id} onChange={set('ubicacion_id')} className="field-select w-full">
              <option value="">— Sin ubicación —</option>
              {ubics.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha adquisición">
            <input type="date" value={form.fecha_adquisicion} onChange={set('fecha_adquisicion')} className="input" />
          </Field>
          <Field label="Moneda">
            <select value={form.moneda} onChange={set('moneda')} className="field-select w-full">
              <option>MXN</option>
              <option>USD</option>
            </select>
          </Field>
        </div>
        <Field label="Descripción">
          <textarea
            value={form.descripcion}
            onChange={set('descripcion')}
            rows={3}
            className="input"
            style={{ minHeight: 80, paddingTop: 10, paddingBottom: 10, resize: 'vertical' }}
          />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={14} strokeWidth={1.75} /> {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? <span className="req"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
