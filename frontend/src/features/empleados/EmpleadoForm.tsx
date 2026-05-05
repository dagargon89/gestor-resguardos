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
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar empleado' : 'Nuevo empleado'}</h1>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre *">
            <input value={form.nombre} onChange={set('nombre')} required className={inp} />
          </Field>
          <Field label="Apellido paterno *">
            <input value={form.apellido_paterno} onChange={set('apellido_paterno')} required className={inp} />
          </Field>
          <Field label="Apellido materno">
            <input value={form.apellido_materno} onChange={set('apellido_materno')} className={inp} />
          </Field>
          <Field label="N° Empleado">
            <input value={form.numero_empleado} onChange={set('numero_empleado')} className={inp} />
          </Field>
          <Field label="Puesto">
            <input value={form.puesto} onChange={set('puesto')} className={inp} />
          </Field>
          <Field label="Organización">
            <select value={form.organizacion_id} onChange={set('organizacion_id')} className={inp}>
              <option value="">— Sin organización —</option>
              {orgs.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </Field>
          <Field label="Departamento">
            <select value={form.departamento_id} onChange={set('departamento_id')} className={inp}>
              <option value="">— Sin departamento —</option>
              {deps.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set('email')} className={inp} />
          </Field>
          <Field label="Teléfono">
            <input value={form.telefono} onChange={set('telefono')} className={inp} />
          </Field>
          <Field label="Estado">
            <select value={form.activo} onChange={set('activo')} className={inp}>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <Save size={16} /> {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
