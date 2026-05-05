import { useEffect, useState } from 'react';
import { request } from '@/lib/apiClient';
import { FileText, Eye, User } from 'lucide-react';
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
      .then(([p, a]) => { setPerfil(p.data); setAsignaciones(a.data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (error)   return <div className="px-4 py-3 bg-red-50 text-red-700 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Mi portal</h1>

      {perfil && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={26} className="text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{`${perfil.nombre} ${perfil.apellido_paterno} ${perfil.apellido_materno ?? ''}`}</p>
            <p className="text-sm text-gray-500">{perfil.puesto}</p>
            <p className="text-sm text-gray-400">{perfil.departamento} · {perfil.organizacion}</p>
            {perfil.email && <p className="text-sm text-blue-600 mt-1">{perfil.email}</p>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Mis asignaciones activas</h2>
          <Link to="/portal/historial" className="text-sm text-blue-600 hover:underline">Ver historial</Link>
        </div>

        {asignaciones.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">Sin asignaciones activas</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Bienes</th>
              <th className="px-4 py-3">Inicio</th>
              <th className="px-4 py-3">Fin</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {asignaciones.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{a.folio}</td>
                  <td className="px-4 py-3 capitalize">{a.tipo}</td>
                  <td className="px-4 py-3 text-gray-500">{a.bienes?.length ?? 0} bien(es)</td>
                  <td className="px-4 py-3 text-gray-500">{a.inicio}</td>
                  <td className="px-4 py-3 text-gray-500">{a.fin_prevista ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/asignaciones/${a.id}/carta`} className="text-gray-400 hover:text-green-600"><FileText size={16} /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
