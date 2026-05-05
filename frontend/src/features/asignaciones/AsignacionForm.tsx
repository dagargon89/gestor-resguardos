import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '@/lib/apiClient';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';

interface Empleado { id: number; nombre_completo: string; }
interface Bien { id: number; codigo_interno: string; nombre: string; estado: string; }
interface BienLinea { bien_id: number; codigo_interno: string; nombre: string; cantidad: number; notas: string; }

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
  const [lineas, setLineas]     = useState<BienLinea[]>([]);
  const [bienSearch, setBienSearch] = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    request<{ data: Empleado[] }>('/empleados?per_page=200&activo=1').then(r => setEmpleados(r.data));
  }, []);

  useEffect(() => {
    if (!bienSearch) { setBienesDisp([]); return; }
    request<{ data: Bien[] }>(`/bienes?q=${bienSearch}&estado_bien_id=1&per_page=20`)
      .then(r => setBienesDisp(r.data));
  }, [bienSearch]);

  function agregarBien(bien: Bien) {
    if (lineas.find(l => l.bien_id === bien.id)) return;
    setLineas(prev => [...prev, { bien_id: bien.id, codigo_interno: bien.codigo_interno, nombre: bien.nombre, cantidad: 1, notas: '' }]);
    setBienSearch('');
    setBienesDisp([]);
  }

  function quitarBien(id: number) {
    setLineas(prev => prev.filter(l => l.bien_id !== id));
  }

  function setLinea(id: number, campo: 'cantidad' | 'notas', valor: string | number) {
    setLineas(prev => prev.map(l => l.bien_id === id ? { ...l, [campo]: valor } : l));
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lineas.length === 0) { setError('Debe agregar al menos un bien'); return; }
    setSaving(true);
    setError(null);
    try {
      await request('/asignaciones', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          empleado_responsable_id: Number(form.empleado_responsable_id),
          bienes: lineas.map(l => ({ bien_id: l.bien_id, cantidad: l.cantidad, notas: l.notas })),
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
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">Nueva asignación</h1>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Datos generales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.tipo} onChange={set('tipo')} required className={inp}>
                <option value="resguardo">Resguardo</option>
                <option value="prestamo">Préstamo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empleado responsable *</label>
              <select value={form.empleado_responsable_id} onChange={set('empleado_responsable_id')} required className={inp}>
                <option value="">— Seleccionar —</option>
                {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
              <input type="date" value={form.inicio} onChange={set('inicio')} required className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin prevista {form.tipo === 'prestamo' ? '*' : '(opcional)'}</label>
              <input type="date" value={form.fin_prevista} onChange={set('fin_prevista')}
                required={form.tipo === 'prestamo'} className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea value={form.observaciones} onChange={set('observaciones')} rows={2} className={inp} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Bienes asignados</h2>

          <div className="relative">
            <input
              value={bienSearch}
              onChange={e => setBienSearch(e.target.value)}
              placeholder="Buscar bien disponible por código o nombre…"
              className={inp}
            />
            {bienesDisp.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {bienesDisp.map(b => (
                  <button key={b.id} type="button" onClick={() => agregarBien(b)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Plus size={14} className="text-green-500" />
                    <span className="font-mono text-xs text-gray-500 w-24">{b.codigo_interno}</span>
                    <span className="truncate">{b.nombre}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {lineas.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Ningún bien agregado aún</p>
          ) : (
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Código</th>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-center w-20">Cant.</th>
                  <th className="px-3 py-2 text-left">Notas</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineas.map(l => (
                  <tr key={l.bien_id}>
                    <td className="px-3 py-2 font-mono text-xs">{l.codigo_interno}</td>
                    <td className="px-3 py-2">{l.nombre}</td>
                    <td className="px-3 py-2">
                      <input type="number" min={1} value={l.cantidad}
                        onChange={e => setLinea(l.bien_id, 'cantidad', Number(e.target.value))}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-xs" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={l.notas}
                        onChange={e => setLinea(l.bien_id, 'notas', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => quitarBien(l.bien_id)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <Save size={16} /> {saving ? 'Guardando…' : 'Crear asignación'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
