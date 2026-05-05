// frontend/src/features/dashboard/Dashboard.tsx

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Boxes, Activity, ArrowDownCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/apiClient';

interface DashboardData {
  kpis: {
    total_activos:    number;
    movimientos_30d:  number;
    activos_baja_30d: number;
  };
  movimientos_por_tipo: Array<{ tipo: string; total: number }>;
  rango: { desde: string; hasta: string };
}

export default function Dashboard() {
  const [data, setData]   = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    api.request<DashboardData>('/reports/dashboard', { signal: ac.signal })
      .then(res => setData(res.data))
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); });
    return () => ac.abort();
  }, []);

  if (error) {
    return <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Resumen del periodo {formatDate(data.rango.desde)} – {formatDate(data.rango.hasta)}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          icon={<Boxes className="text-brand-600" />}
          label="Total de activos"
          value={data.kpis.total_activos}
        />
        <KpiCard
          icon={<Activity className="text-emerald-600" />}
          label="Movimientos (30d)"
          value={data.kpis.movimientos_30d}
        />
        <KpiCard
          icon={<ArrowDownCircle className="text-amber-600" />}
          label="Bajas (30d)"
          value={data.kpis.activos_baja_30d}
        />
      </div>

      {/* Gráfica */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Movimientos por tipo</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.movimientos_por_tipo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="total" fill="oklch(0.55 0.18 240)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function KpiCard({ icon, label, value }: KpiCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value.toLocaleString('es-MX')}
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}
