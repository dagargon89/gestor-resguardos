import { useEffect, useState } from 'react';
import { request } from '@/lib/apiClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ArrowUpDown, TrendingDown } from 'lucide-react';

interface KPIs {
  total_activos: number;
  movimientos_30d: number;
  activos_baja_30d: number;
}

interface DashboardData {
  kpis: KPIs;
  movimientos_por_tipo: { tipo: string; total: number }[];
  rango: { desde: string; hasta: string };
}

function KpiCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: typeof Package; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    request<{ data: DashboardData }>('/reports/dashboard')
      .then(res => setData(res.data))
      .catch(e => { if (!ctrl.signal.aborted) setError(e.message); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (error)   return <p className="text-red-600">{error}</p>;
  if (!data)   return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total bienes"      value={data.kpis.total_activos}   icon={Package}      color="bg-blue-500" />
        <KpiCard label="Movimientos (30d)" value={data.kpis.movimientos_30d} icon={ArrowUpDown}  color="bg-green-500" />
        <KpiCard label="Bajas (30d)"       value={data.kpis.activos_baja_30d}icon={TrendingDown} color="bg-red-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Movimientos por tipo (últimos 30 días)</h2>
        {data.movimientos_por_tipo.length === 0 ? (
          <p className="text-sm text-gray-400">Sin movimientos en el período</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.movimientos_por_tipo} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
