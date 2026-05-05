// Pages: Dashboard, Bienes, Asignaciones, Empleados, Organizaciones, Departamentos,
// Reportes, Usuarios, Configuracion, Portal, Perfil, Login

const PageDashboard = () => {
  const { setRoute } = useApp();
  return (
    <div className="content-narrow" data-screen-label="dashboard">
      <PageHead
        eyebrow="Inicio"
        title="Buenas tardes, María Elena"
        sub="Resumen general del inventario y resguardos al 5 de mayo de 2026."
        actions={<>
          <button className="btn"><I.Download size={14}/>Exportar resumen</button>
          <button className="btn btn-primary"><I.Plus size={14}/>Nueva asignación</button>
        </>}
      />

      <div className="kpi-grid">
        {KPIS.map((k, i) => {
          const Ic = I[k.icon];
          return (
            <div key={i} className="kpi">
              <div className="kpi-label"><Ic/>{k.label}</div>
              <div className="kpi-value tnum">{k.value.toLocaleString('es-MX')}</div>
              <div className="kpi-meta">
                <span className={`kpi-trend ${k.deltaDir === 'up' ? 'up' : 'down'}`}>
                  {k.deltaDir === 'up' ? <I.TrendUp size={12}/> : <I.TrendDown size={12}/>} {k.delta}
                </span>
                <span className="dim">vs. mes anterior</span>
              </div>
              <div className="kpi-spark"><Sparkline data={k.spark} w={92} h={28}/></div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="chart-wrap">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3>Movimiento de bienes</h3>
              <div className="muted" style={{ fontSize: 12 }}>Asignaciones, devoluciones y altas — últimos 30 días</div>
            </div>
            <div className="seg">
              <button className="active">30D</button>
              <button>90D</button>
              <button>1A</button>
            </div>
          </div>
          <BarChart/>
        </div>

        <div className="chart-wrap">
          <h3>Distribución por categoría</h3>
          <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>1,207 bienes activos</div>
          <CategoryBars/>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card card-pad">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3>Asignaciones recientes</h3>
            <button className="linkish" style={{ fontSize: 12 }} onClick={() => setRoute('asignaciones')}>Ver todas →</button>
          </div>
          <table className="table" style={{ marginTop: 4 }}>
            <thead><tr><th>Folio</th><th>Empleado</th><th>Bienes</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
              {ASIGNACIONES.slice(0, 5).map(a => {
                const e = empleadoById(a.empleado);
                return (
                  <tr key={a.id}>
                    <td className="mono" style={{ color: 'var(--text-1)' }}>{a.folio}</td>
                    <td><div className="row gap-2"><div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{initialsOf(e.nombre, e.apellidos)}</div>{e.nombre} {e.apellidos.split(' ')[0]}</div></td>
                    <td className="muted">{a.bienes.length} {a.bienes.length === 1 ? 'bien' : 'bienes'}</td>
                    <td><StatusChip value={a.estado}/></td>
                    <td className="muted tnum">{a.fechaInicio}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card card-pad">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3>Por organización</h3>
            <button className="linkish" style={{ fontSize: 12 }}>Detalle</button>
          </div>
          <div className="col gap-3">
            {ORGS.map(o => {
              const pct = (o.bienes / 1500) * 100;
              return (
                <div key={o.id}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                    <div className="row gap-2" style={{ fontSize: 13 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: o.color, display: 'inline-block' }}/>
                      <span style={{ fontWeight: 500 }}>{o.siglas}</span>
                      <span className="dim">— {o.nombre}</span>
                    </div>
                    <span className="tnum" style={{ fontSize: 12 }}>{o.bienes}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-1)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: o.color, borderRadius: 4 }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card card-pad">
          <h3 style={{ marginBottom: 4 }}>Actividad reciente</h3>
          <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>Últimas operaciones registradas en bitácora.</div>
          <div className="timeline">
            {EVENTOS.slice(0, 5).map((e, i) => (
              <div key={i} className={`tl-item ${e.sev}`}>
                <div className="tl-dot"/>
                <div className="tl-time mono">{e.fecha}</div>
                <div className="tl-title">{e.titulo}</div>
                <div className="tl-desc">{e.desc} <span className="dim">— {e.actor}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginBottom: 4 }}>Devoluciones pendientes</h3>
          <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>Resguardos sin movimiento en más de 90 días.</div>
          <div className="col gap-2">
            {[
              { folio: 'RG-2024-0118', emp: 'Daniela Robles', dias: 142, sev: 'danger' },
              { folio: 'RG-2024-0455', emp: 'Ana Beatriz Cuevas', dias: 121, sev: 'danger' },
              { folio: 'RG-2024-0622', emp: 'Adrián Hinojosa', dias: 98, sev: 'warn' },
              { folio: 'RG-2024-0819', emp: 'Ximena Galván', dias: 92, sev: 'warn' },
            ].map((d, i) => (
              <div key={i} className="row" style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-1)', border: '1px solid var(--line-1)', gap: 12 }}>
                <span className={`dot ${d.sev}`}/>
                <div className="col flex-1" style={{ gap: 0 }}>
                  <div className="mono" style={{ fontSize: 12 }}>{d.folio}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{d.emp}</div>
                </div>
                <span className="tnum" style={{ fontSize: 12, color: d.sev === 'danger' ? 'var(--danger)' : 'var(--warn)' }}>{d.dias} días</span>
                <button className="btn btn-sm">Recordar</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BarChart = () => {
  const data = [
    [22,18,16,14,20,8,4],[28,22,19,17,24,10,5],[18,15,12,11,17,6,3],[32,28,24,22,30,12,6],
    [25,20,18,16,22,9,4],[30,26,23,21,28,11,5],[20,16,14,12,18,7,3],[35,30,26,24,32,13,7],
    [28,24,21,19,26,10,5],[22,18,16,14,20,8,4],[34,29,25,23,31,12,6],[27,23,20,18,25,10,5],
  ];
  const w = 600, h = 200, pad = 24;
  const max = 50;
  const bw = (w - pad * 2) / data.length - 6;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {[0, 12, 25, 37, 50].map(v => {
        const y = h - pad - (v / max) * (h - pad * 2);
        return <g key={v}>
          <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="var(--line-1)" strokeDasharray="2 4"/>
          <text x={pad - 6} y={y + 3} fontSize="10" fill="var(--text-3)" textAnchor="end" fontFamily="var(--font-mono)">{v}</text>
        </g>;
      })}
      {data.map((d, i) => {
        const x = pad + i * (bw + 6);
        const total = d[0];
        const yTop = h - pad - (total / max) * (h - pad * 2);
        const hgt = (total / max) * (h - pad * 2);
        return (
          <g key={i}>
            <rect x={x} y={yTop} width={bw} height={hgt} fill="var(--accent)" rx="2" opacity="0.85"/>
            <rect x={x} y={yTop} width={bw} height={Math.min(8, hgt)} fill="var(--accent)" rx="2"/>
            <text x={x + bw / 2} y={h - 6} fontSize="9" fill="var(--text-3)" textAnchor="middle" fontFamily="var(--font-mono)">
              {(['1','5','10','15','20','25','30'])[Math.floor(i * 7 / 12)] || ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const CategoryBars = () => (
  <div className="col gap-3">
    {CATEGORIAS.map(c => {
      const pct = (c.count / 412) * 100;
      return (
        <div key={c.id}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
            <span>{c.nombre}</span>
            <span className="tnum dim">{c.count}</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: 4 }}/>
          </div>
        </div>
      );
    })}
  </div>
);

Object.assign(window, { PageDashboard });
