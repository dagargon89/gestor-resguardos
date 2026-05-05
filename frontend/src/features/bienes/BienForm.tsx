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
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar bien' : 'Nuevo bien'}</h1>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Código interno *" required>
            <input value={form.codigo_interno} onChange={set('codigo_interno')} required className={inp} />
          </Field>
          <Field label="Nombre *" required>
            <input value={form.nombre} onChange={set('nombre')} required className={inp} />
          </Field>
          <Field label="Marca">
            <input value={form.marca} onChange={set('marca')} className={inp} />
          </Field>
          <Field label="Modelo">
            <input value={form.modelo} onChange={set('modelo')} className={inp} />
          </Field>
          <Field label="Número de serie">
            <input value={form.numero_serie} onChange={set('numero_serie')} className={inp} />
          </Field>
          <Field label="Precio unitario">
            <input type="number" step="0.01" value={form.precio_unitario} onChange={set('precio_unitario')} className={inp} />
          </Field>
          <Field label="Organización">
            <select value={form.organizacion_id} onChange={set('organizacion_id')} className={inp}>
              <option value="">— Sin organización —</option>
              {orgs.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </Field>
          <Field label="Categoría">
            <select value={form.categoria_id} onChange={set('categoria_id')} className={inp}>
              <option value="">— Sin categoría —</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select value={form.estado_bien_id} onChange={set('estado_bien_id')} className={inp}>
              <option value="">— Sin estado —</option>
              {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </Field>
          <Field label="Ubicación">
            <select value={form.ubicacion_id} onChange={set('ubicacion_id')} className={inp}>
              <option value="">— Sin ubicación —</option>
              {ubics.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </Field>
          <Field label="Fecha adquisición">
            <input type="date" value={form.fecha_adquisicion} onChange={set('fecha_adquisicion')} className={inp} />
          </Field>
          <Field label="Moneda">
            <select value={form.moneda} onChange={set('moneda')} className={inp}>
              <option>MXN</option><option>USD</option>
            </select>
          </Field>
        </div>
        <Field label="Descripción">
          <textarea value={form.descripcion} onChange={set('descripcion')} rows={3} className={inp} />
        </Field>
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
