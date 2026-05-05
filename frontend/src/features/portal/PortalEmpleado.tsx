import { useEffect, useState } from 'react';
import { request } from '@/lib/apiClient';
import { FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Perfil {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  puesto: string;
  departamento: string;
  organizacion: string;
  email: string;
}

interface Asignacion {
  id: number;
  folio: string;
  tipo: string;
  estado: string;
  inicio: string;
  fin_prevista: string | null;
  bienes: { nombre: string }[];
}

export default function PortalEmpleado() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      request<{ data: Perfil }>('/portal/perfil'),
      request<{ data: Asignacion[] }>('/portal/mis-asignaciones?estado=activa'),
    ])
      .then(([p, a]) => {
        setPerfil(p.data);
        setAsignaciones(a.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--line-2)] border-t-[var(--accent)]" />
      </div>
    );
  }
  if (error) {
    return (
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
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="page-head mb-0">
        <div className="page-title">
          <span className="eyebrow">Empleado</span>
          <h1>Mi portal</h1>
          <span className="sub">Resumen de tu perfil y asignaciones activas</span>
        </div>
      </div>

      {perfil && (
        <div className="card card-pad flex items-start gap-4">
          <div
            className="avatar avatar-lg shrink-0"
            style={{
              background: 'var(--accent-soft)',
              borderColor: 'var(--accent-line)',
              color: 'var(--accent)',
            }}
          >
            <User size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>
              {`${perfil.nombre} ${perfil.apellido_paterno} ${perfil.apellido_materno ?? ''}`}
            </p>
            <p className="muted text-sm">{perfil.puesto}</p>
            <p className="dim mt-1 text-sm">
              {perfil.departamento} · {perfil.organizacion}
            </p>
            {perfil.email && (
              <p className="linkish mt-2 text-sm">{perfil.email}</p>
            )}
          </div>
        </div>
      )}

      <div className="table-wrap">
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
          style={{ borderColor: 'var(--line-1)' }}
        >
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>
            Mis asignaciones activas
          </h2>
        </div>

        {asignaciones.length === 0 ? (
          <p className="dim py-10 text-center text-sm">Sin asignaciones activas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Tipo</th>
                  <th>Bienes</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {asignaciones.map((a) => (
                  <tr key={a.id}>
                    <td className="mono">
                      <span className="gr-code">{a.folio}</span>
                    </td>
                    <td className="capitalize muted">{a.tipo}</td>
                    <td className="muted">{a.bienes?.length ?? 0} bien(es)</td>
                    <td className="muted tnum">{a.inicio}</td>
                    <td className="muted tnum">{a.fin_prevista ?? '—'}</td>
                    <td>
                      <div className="row justify-end">
                        <Link to={`/asignaciones/${a.id}/carta`} className="icon-action">
                          <FileText size={16} strokeWidth={1.75} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
