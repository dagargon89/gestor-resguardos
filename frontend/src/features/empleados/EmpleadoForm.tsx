import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { request } from '@/lib/apiClient';
import { Save, ArrowLeft } from 'lucide-react';

interface Catalogo { id: number; nombre: string; }

export default function EmpleadoForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form, setForm] = useState({
    numero_empleado: '', nombre: '', apellido_paterno: '', apellido_materno: '',
    puesto: '', departamento_id: '', organizacion_id: '', email: '', telefono: '', activo: '1',
  });
  const [orgs, setOrgs]   = useState<Catalogo[]>([]);
  const [deps, setDeps]   = useState<Catalogo[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    request<{ data: Catalogo[] }>('/catalogs/organizaciones').then(r => setOrgs(r.data));
    if (isEdit) {
      request<{ data: typeof form }>(`/empleados/${id}`).then(r => setForm(f => ({ ...f, ...r.data })));
    }
  }, [id]);

  useEffect(() => {
    if (!form.organizacion_id) return;
    request<{ data: Catalogo[] }>(`/catalogs/departamentos?organizacion_id=${form.organizacion_id}`)
      .then(r => setDeps(r.data));
  }, [form.organizacion_id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await request(`/empleados/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await request('/empleados', { method: 'POST', body: JSON.stringify(form) });
      }
      navigate('/empleados');
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
          <span className="eyebrow">Personas</span>
          <h1>{isEdit ? 'Editar empleado' : 'Nuevo empleado'}</h1>
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
          <Field label="Nombre *">
            <input value={form.nombre} onChange={set('nombre')} required className="input" />
          </Field>
          <Field label="Apellido paterno *">
            <input value={form.apellido_paterno} onChange={set('apellido_paterno')} required className="input" />
          </Field>
          <Field label="Apellido materno">
            <input value={form.apellido_materno} onChange={set('apellido_materno')} className="input" />
          </Field>
          <Field label="N° Empleado">
            <input value={form.numero_empleado} onChange={set('numero_empleado')} className="input mono" />
          </Field>
          <Field label="Puesto">
            <input value={form.puesto} onChange={set('puesto')} className="input" />
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
          <Field label="Departamento">
            <select value={form.departamento_id} onChange={set('departamento_id')} className="field-select w-full">
              <option value="">— Sin departamento —</option>
              {deps.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set('email')} className="input" />
          </Field>
          <Field label="Teléfono">
            <input value={form.telefono} onChange={set('telefono')} className="input" />
          </Field>
          <Field label="Estado">
            <select value={form.activo} onChange={set('activo')} className="field-select w-full">
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </Field>
        </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
