import { useEffect, useState } from 'react';
import { request } from '@/lib/apiClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

function KpiBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Package;
}) {
  return (
    <div className="kpi">
      <div className="kpi-label">
        <Icon className="ico" size={14} strokeWidth={1.75} />
        {label}
      </div>
      <div className="kpi-value tnum">{value.toLocaleString('es-MX')}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    request<{ data: DashboardData }>('/reports/dashboard')
      .then((res) => setData(res.data))
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--line-2)] border-t-[var(--accent)]"
          aria-hidden
        />
      </div>
    );
  }
  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!data) return null;

  const accent = typeof document !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4ade80'
    : '#4ade80';

  return (
    <div className="space-y-6">
      <div className="page-head">
        <div className="page-title">
          <span className="eyebrow">General</span>
          <h1>Dashboard</h1>
          <span className="sub">
            Resumen de inventario y movimientos
            {data.rango?.desde && data.rango?.hasta
              ? ` · ${data.rango.desde} — ${data.rango.hasta}`
              : ''}
          </span>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiBlock label="Total bienes" value={data.kpis.total_activos} icon={Package} />
        <KpiBlock label="Movimientos (30 días)" value={data.kpis.movimientos_30d} icon={ArrowUpDown} />
        <KpiBlock label="Bajas (30 días)" value={data.kpis.activos_baja_30d} icon={TrendingDown} />
      </div>

      <div className="chart-wrap">
        <h2 className="mb-4 text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>
          Movimientos por tipo (últimos 30 días)
        </h2>
        {data.movimientos_por_tipo.length === 0 ? (
          <p className="dim text-sm">Sin movimientos en el período</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.movimientos_por_tipo} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line-1)" />
              <XAxis
                dataKey="tipo"
                tick={{ fontSize: 12, fill: 'var(--text-2)' }}
                axisLine={{ stroke: 'var(--line-2)' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: 'var(--text-2)' }}
                axisLine={{ stroke: 'var(--line-2)' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line-1)',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--text-1)',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="total" fill={accent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
