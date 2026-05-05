import { useEffect, useState } from 'react';
import { request } from '@/lib/apiClient';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Org { id: number; nombre: string; clave: string; descripcion: string; activo: number; }

export default function Organizaciones() {
  const [rows, setRows]     = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState<Org | null | 'nuevo'>(null);
  const [form, setForm]     = useState({ nombre: '', clave: '', descripcion: '' });
  const [saving, setSaving] = useState(false);

  function fetchData() {
    setLoading(true);
    request<{ data: Org[] }>('/organizaciones').then(r => setRows(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  function openEdit(o: Org) {
    setForm({ nombre: o.nombre, clave: o.clave ?? '', descripcion: o.descripcion ?? '' });
    setModal(o);
  }

  function openNew() {
    setForm({ nombre: '', clave: '', descripcion: '' });
    setModal('nuevo');
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal === 'nuevo') {
        await request('/organizaciones', { method: 'POST', body: JSON.stringify(form) });
      } else if (modal && typeof modal === 'object') {
        await request(`/organizaciones/${modal.id}`, { method: 'PUT', body: JSON.stringify(form) });
      }
      setModal(null);
      fetchData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    await request(`/organizaciones/${id}`, { method: 'DELETE' });
    fetchData();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Organizaciones</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus size={16} /> Nueva organización
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
            <th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Clave</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={4} className="text-center py-10 text-gray-400">Cargando…</td></tr>
            : rows.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{o.nombre}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{o.clave || '—'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${o.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{o.activo ? 'Activa' : 'Inactiva'}</span></td>
                <td className="px-4 py-3"><div className="flex gap-2 justify-end">
                  <button onClick={() => openEdit(o)} className="text-gray-400 hover:text-yellow-600"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(o.id, o.nombre)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold">{modal === 'nuevo' ? 'Nueva organización' : 'Editar organización'}</h2>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required className={inp} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
                <input value={form.clave} onChange={e => setForm(f => ({ ...f, clave: e.target.value }))} className={inp} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={2} className={inp} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm">{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
