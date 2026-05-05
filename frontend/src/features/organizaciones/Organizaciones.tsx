import { useEffect, useState } from 'react';
import { request } from '@/lib/apiClient';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Org {
  id: number;
  nombre: string;
  clave: string;
  descripcion: string;
  activo: number;
}

export default function Organizaciones() {
  const [rows, setRows] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Org | null | 'nuevo'>(null);
  const [form, setForm] = useState({ nombre: '', clave: '', descripcion: '' });
  const [saving, setSaving] = useState(false);

  function fetchData() {
    setLoading(true);
    request<{ data: Org[] }>('/organizaciones')
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

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
        await request(`/organizaciones/${modal.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
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
      <div className="page-head">
        <div className="page-title">
          <span className="eyebrow">Personas</span>
          <h1>Organizaciones</h1>
          <span className="sub">Unidades administrativas</span>
        </div>
        <div className="page-actions">
          <button type="button" onClick={openNew} className="btn btn-primary">
            <Plus size={14} strokeWidth={1.75} /> Nueva organización
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Clave</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="dim text-center py-10">
                    Cargando…
                  </td>
                </tr>
              ) : (
                rows.map((o) => (
                  <tr key={o.id}>
                    <td>{o.nombre}</td>
                    <td className="mono muted text-xs">{o.clave || '—'}</td>
                    <td>
                      <span className={`chip ${o.activo ? 'ok' : ''}`}>
                        <span className="chip-dot" />
                        {o.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <div className="row justify-end gap-2">
                        <button type="button" onClick={() => openEdit(o)} className="icon-action icon-action--warn">
                          <Pencil size={16} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(o.id, o.nombre)}
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
      </div>

      {modal !== null && (
        <>
          <div className="scrim" role="presentation" onClick={() => !saving && setModal(null)} />
          <div className="modal" style={{ width: 'min(420px, 96vw)' }}>
            <div className="modal-head">
              <h2>{modal === 'nuevo' ? 'Nueva organización' : 'Editar organización'}</h2>
            </div>
            <div className="modal-body space-y-4">
              <label className="field">
                <span>
                  Nombre <span className="req">*</span>
                </span>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  required
                  className="input"
                />
              </label>
              <label className="field">
                <span>Clave</span>
                <input
                  value={form.clave}
                  onChange={(e) => setForm((f) => ({ ...f, clave: e.target.value }))}
                  className="input mono"
                />
              </label>
              <label className="field">
                <span>Descripción</span>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={3}
                  className="input"
                  style={{ minHeight: 72, paddingTop: 10, paddingBottom: 10, resize: 'vertical' }}
                />
              </label>
            </div>
            <div className="modal-foot">
              <button type="button" disabled={saving} className="btn btn-ghost" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button type="button" disabled={saving} className="btn btn-primary" onClick={handleSave}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
