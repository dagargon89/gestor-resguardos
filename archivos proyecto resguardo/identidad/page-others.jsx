// Empleados, Organizaciones, Departamentos, Reportes, Usuarios, Configuracion, Portal, Perfil, Login

const PageEmpleados = () => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const filtered = EMPLEADOS.filter(e => `${e.nombre} ${e.apellidos} ${e.id} ${e.rfc}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="content-narrow" data-screen-label="empleados">
      <PageHead
        eyebrow="Personas"
        title="Empleados"
        sub={`${EMPLEADOS.length} empleados activos · 318 con resguardo asignado`}
        actions={<>
          <button className="btn"><I.Upload size={14}/>Importar CSV</button>
          <button className="btn"><I.Download size={14}/>Exportar</button>
          <button className="btn btn-primary"><I.Plus size={14}/>Nuevo empleado</button>
        </>}
      />
      <div className="toolbar">
        <div className="searchbox" style={{ flex: '0 0 320px' }}>
          <I.Search size={14} className="ico-left"/>
          <input className="input input-search" placeholder="Nombre, ID, RFC, correo…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <button className="btn btn-sm"><I.Filter size={13}/>Organización</button>
        <button className="btn btn-sm"><I.Filter size={13}/>Departamento</button>
        <div className="spacer"/>
        <span className="muted" style={{ fontSize: 12 }}>{filtered.length} resultados</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr>
            <th>ID</th><th>Empleado</th><th>Puesto</th><th>Organización</th><th>Departamento</th><th>RFC</th><th className="col-num">Bienes</th><th>Ingreso</th><th style={{ width: 50 }}></th>
          </tr></thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} onClick={() => setSelected(e)}>
                <td className="mono" style={{ fontSize: 12 }}>{e.id}</td>
                <td>
                  <div className="row gap-2">
                    <div className="avatar">{initialsOf(e.nombre, e.apellidos)}</div>
                    <div className="col" style={{ gap: 0 }}>
                      <span style={{ fontWeight: 500 }}>{e.nombre} {e.apellidos}</span>
                      <span className="dim" style={{ fontSize: 11.5 }}>{e.correo}</span>
                    </div>
                  </div>
                </td>
                <td className="muted" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.puesto}</td>
                <td>{orgById(e.org)?.siglas}</td>
                <td className="muted">{depById(e.dep)?.nombre}</td>
                <td className="mono" style={{ fontSize: 12 }}>{e.rfc}</td>
                <td className="col-num tnum"><span className="tag">{e.activos}</span></td>
                <td className="muted tnum mono" style={{ fontSize: 12 }}>{e.ingreso}</td>
                <td onClick={ev => ev.stopPropagation()}><button className="btn btn-icon btn-sm btn-ghost"><I.More size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <EmpleadoDrawer emp={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
};

const EmpleadoDrawer = ({ emp, onClose }) => {
  const asgEmp = ASIGNACIONES.filter(a => a.empleado === emp.id);
  return (
    <Drawer open onClose={onClose} eyebrow={emp.id} title={`${emp.nombre} ${emp.apellidos}`}
      footer={<>
        <button className="btn"><I.Edit size={14}/>Editar</button>
        <div className="flex-1"/>
        <button className="btn btn-primary"><I.Plus size={14}/>Nueva asignación</button>
      </>}>
      <div className="row gap-3" style={{ marginBottom: 16 }}>
        <div className="avatar avatar-lg" style={{ width: 56, height: 56, fontSize: 16 }}>{initialsOf(emp.nombre, emp.apellidos)}</div>
        <div className="col flex-1" style={{ gap: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{emp.nombre} {emp.apellidos}</div>
          <div className="muted" style={{ fontSize: 13 }}>{emp.puesto}</div>
          <div className="row gap-2"><span className="chip accent">{orgById(emp.org)?.siglas}</span><span className="chip">{depById(emp.dep)?.nombre}</span></div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <DataField label="Correo" value={emp.correo}/>
        <DataField label="Teléfono" value={emp.telefono} mono/>
        <DataField label="RFC" value={emp.rfc} mono/>
        <DataField label="CURP" value={emp.curp} mono/>
        <DataField label="Ingreso" value={emp.ingreso} mono/>
        <DataField label="Bienes activos" value={emp.activos}/>
      </div>
      <div className="section-title" style={{ marginBottom: 8 }}>Asignaciones ({asgEmp.length})</div>
      <div className="col gap-2">
        {asgEmp.map(a => (
          <div key={a.id} className="row gap-3" style={{ padding: 10, border: '1px solid var(--line-1)', borderRadius: 8, background: 'var(--bg-1)' }}>
            <I.Clipboard size={16}/>
            <div className="col flex-1" style={{ gap: 1 }}>
              <span className="mono" style={{ fontSize: 12 }}>{a.folio}</span>
              <span className="dim" style={{ fontSize: 11.5 }}>{a.bienes.length} bien(es) · desde {a.fechaInicio}</span>
            </div>
            <StatusChip value={a.estado}/>
          </div>
        ))}
      </div>
    </Drawer>
  );
};

// ---------- Organizaciones ----------
const PageOrganizaciones = () => (
  <div className="content-narrow" data-screen-label="organizaciones">
    <PageHead eyebrow="Personas" title="Organizaciones" sub={`${ORGS.length} organizaciones registradas`}
      actions={<button className="btn btn-primary"><I.Plus size={14}/>Nueva organización</button>}/>
    <div className="cards-grid">
      {ORGS.map(o => (
        <div key={o.id} className="card card-pad">
          <div className="row gap-3" style={{ marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: o.color + '22', border: `1px solid ${o.color}55`, display: 'grid', placeItems: 'center', color: o.color, fontWeight: 700 }}>{o.siglas.slice(0, 2)}</div>
            <div className="col flex-1" style={{ gap: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{o.siglas}</div>
              <div className="muted" style={{ fontSize: 12 }}>{o.nombre}</div>
            </div>
            <button className="btn btn-icon btn-sm btn-ghost"><I.More size={14}/></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="col" style={{ padding: 10, background: 'var(--bg-1)', borderRadius: 6, gap: 0 }}>
              <span className="muted" style={{ fontSize: 11 }}>Empleados</span>
              <span className="tnum" style={{ fontSize: 18, fontWeight: 600 }}>{o.empleados}</span>
            </div>
            <div className="col" style={{ padding: 10, background: 'var(--bg-1)', borderRadius: 6, gap: 0 }}>
              <span className="muted" style={{ fontSize: 11 }}>Bienes</span>
              <span className="tnum" style={{ fontSize: 18, fontWeight: 600 }}>{o.bienes}</span>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>{DEPTOS.filter(d => d.org === o.id).length} departamento(s)</div>
        </div>
      ))}
    </div>
  </div>
);

// ---------- Departamentos ----------
const PageDepartamentos = () => (
  <div className="content-narrow" data-screen-label="departamentos">
    <PageHead eyebrow="Personas" title="Departamentos" sub={`${DEPTOS.length} departamentos en ${ORGS.length} organizaciones`}
      actions={<button className="btn btn-primary"><I.Plus size={14}/>Nuevo departamento</button>}/>
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Departamento</th><th>Organización</th><th>Responsable</th><th className="col-num">Empleados</th><th style={{ width: 50 }}></th></tr></thead>
        <tbody>
          {DEPTOS.map(d => {
            const o = orgById(d.org);
            return (
              <tr key={d.id}>
                <td>
                  <div className="row gap-2"><I.Folder size={14}/><span style={{ fontWeight: 500 }}>{d.nombre}</span></div>
                </td>
                <td><span className="chip" style={{ borderColor: o.color + '55', color: o.color, background: o.color + '22' }}>{o.siglas}</span></td>
                <td className="muted">{d.responsable}</td>
                <td className="col-num tnum">{d.empleados}</td>
                <td><button className="btn btn-icon btn-sm btn-ghost"><I.More size={14}/></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// ---------- Reportes ----------
const PageReportes = () => {
  const [tab, setTab] = useState('bitacora');
  return (
    <div className="content-narrow" data-screen-label="reportes">
      <PageHead eyebrow="Análisis" title="Reportes"
        sub="Bitácora del sistema y consultas operativas. Exportable a Excel y PDF."
        actions={<>
          <button className="btn"><I.Refresh size={14}/>Actualizar</button>
          <button className="btn"><I.Download size={14}/>Excel</button>
          <button className="btn"><I.Print size={14}/>PDF</button>
        </>}/>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {[['bitacora','Bitácora'],['inventario','Inventario consultivo'],['asignaciones','Asignaciones agregadas']].map(([k, l]) => (
          <div key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab === 'bitacora' && <ReporteBitacora/>}
      {tab === 'inventario' && <ReporteInventario/>}
      {tab === 'asignaciones' && <ReporteAsignaciones/>}
    </div>
  );
};

const ReporteBitacora = () => (
  <>
    <div className="toolbar">
      <div className="searchbox" style={{ flex: '0 0 280px' }}>
        <I.Search size={14} className="ico-left"/>
        <input className="input input-search" placeholder="Acción, recurso, IP…"/>
      </div>
      <button className="btn btn-sm"><I.Calendar size={13}/>Últimas 24 h</button>
      <button className="btn btn-sm"><I.Filter size={13}/>Usuario</button>
      <button className="btn btn-sm"><I.Filter size={13}/>Resultado</button>
      <div className="spacer"/>
      <span className="muted" style={{ fontSize: 12 }}>{BITACORA.length} eventos</span>
    </div>
    <div className="table-wrap">
      <table className="table">
        <thead><tr>
          <th>ID</th><th>Fecha</th><th>Usuario</th><th>Rol</th><th>Acción</th><th>Recurso</th><th>IP</th><th>Resultado</th>
        </tr></thead>
        <tbody>
          {BITACORA.map(b => (
            <tr key={b.id}>
              <td className="mono" style={{ fontSize: 11.5 }}>#{b.id}</td>
              <td className="mono" style={{ fontSize: 11.5 }}>{b.fecha}</td>
              <td>{b.usuario}</td>
              <td className="muted">{b.rol}</td>
              <td className="mono" style={{ fontSize: 12 }}>{b.accion}</td>
              <td className="mono muted" style={{ fontSize: 11.5 }}>{b.recurso}</td>
              <td className="mono dim" style={{ fontSize: 11.5 }}>{b.ip}</td>
              <td><StatusChip value={b.resultado}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

const ReporteInventario = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
    <div className="chart-wrap">
      <h3>Valor del inventario por categoría</h3>
      <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>Total: {fmtMXN(BIENES.reduce((s, b) => s + b.costo, 0))} · {BIENES.length} bienes</div>
      <CategoryBars/>
    </div>
    <div className="card card-pad">
      <h3 style={{ marginBottom: 12 }}>Por estado</h3>
      <div className="col gap-3">
        {[
          { l: 'Asignados', v: BIENES.filter(b => b.estado === 'Asignado').length, c: 'var(--accent)' },
          { l: 'Disponibles', v: BIENES.filter(b => b.estado === 'Disponible').length, c: 'var(--info)' },
          { l: 'En mantenimiento', v: BIENES.filter(b => b.estado === 'Mantenimiento').length, c: 'var(--warn)' },
        ].map((s, i) => (
          <div key={i}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
              <span>{s.l}</span><span className="tnum">{s.v}</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-1)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(s.v / BIENES.length) * 100}%`, background: s.c, borderRadius: 3 }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ReporteAsignaciones = () => (
  <div className="cards-grid">
    {ORGS.map(o => {
      const cnt = ASIGNACIONES.filter(a => empleadoById(a.empleado)?.org === o.id).length;
      return (
        <div key={o.id} className="card card-pad">
          <div className="row gap-2" style={{ marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: o.color }}/>
            <span style={{ fontWeight: 500, fontSize: 13 }}>{o.siglas}</span>
            <div className="flex-1"/>
            <span className="tnum" style={{ fontSize: 18, fontWeight: 600 }}>{cnt}</span>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>{o.nombre}</div>
        </div>
      );
    })}
  </div>
);

// ---------- Usuarios y acceso ----------
const PageUsuarios = () => {
  const [tab, setTab] = useState('usuarios');
  return (
    <div className="content-narrow" data-screen-label="usuarios">
      <PageHead eyebrow="Administración" title="Usuarios y acceso"
        sub={`${USUARIOS.length} cuentas internas · ${GRUPOS.length} grupos de Shield`}
        actions={<>
          <button className="btn"><I.Key size={14}/>Auditar accesos</button>
          <button className="btn btn-primary"><I.Plus size={14}/>Nuevo usuario</button>
        </>}/>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {[['usuarios','Usuarios'],['grupos','Grupos y permisos'],['sesiones','Sesiones activas']].map(([k, l]) => (
          <div key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>
      {tab === 'usuarios' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Usuario</th><th>Correo</th><th>Grupo</th><th>Estado</th><th>Último ingreso</th><th>Empleado</th><th style={{ width: 50 }}></th></tr></thead>
            <tbody>
              {USUARIOS.map(u => {
                const grupo = GRUPOS.find(g => g.id === u.grupos[0]);
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="row gap-2">
                        <div className="avatar">{u.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}</div>
                        <div className="col" style={{ gap: 0 }}>
                          <span style={{ fontWeight: 500 }}>{u.nombre}</span>
                          <span className="dim mono" style={{ fontSize: 11 }}>@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{u.correo}</td>
                    <td><span className={`chip ${grupo?.color || ''}`}>{grupo?.nombre}</span></td>
                    <td><StatusChip value={u.estado}/></td>
                    <td className="muted mono" style={{ fontSize: 11.5 }}>{u.ultimoIngreso}</td>
                    <td className="mono dim" style={{ fontSize: 11.5 }}>{u.empleado}</td>
                    <td><button className="btn btn-icon btn-sm btn-ghost"><I.More size={14}/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'grupos' && (
        <div className="cards-grid">
          {GRUPOS.map(g => (
            <div key={g.id} className="card card-pad">
              <div className="row gap-2" style={{ marginBottom: 8 }}>
                <span className={`chip ${g.color}`}><I.Shield size={11}/>{g.nombre}</span>
                <div className="flex-1"/>
                <button className="btn btn-icon btn-sm btn-ghost"><I.More size={14}/></button>
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>{g.desc}</div>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span className="tnum" style={{ fontSize: 22, fontWeight: 600 }}>{g.usuarios}</span>
                <span className="muted" style={{ fontSize: 11 }}>{g.usuarios === 1 ? 'usuario' : 'usuarios'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'sesiones' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Usuario</th><th>IP</th><th>Dispositivo</th><th>Inicio</th><th>Último acceso</th><th></th></tr></thead>
            <tbody>
              {[
                { u: 'mtorres', ip: '10.0.4.18', dev: 'MacBook Pro · Chrome 124', start: '2026-05-05 08:42', last: '2026-05-05 09:42' },
                { u: 'cresendiz', ip: '10.0.4.22', dev: 'iPad · Safari', start: '2026-05-05 09:01', last: '2026-05-05 09:31' },
                { u: 'rmendoza', ip: '10.0.4.31', dev: 'Windows · Edge', start: '2026-05-05 07:55', last: '2026-05-05 08:56' },
                { u: 'jvazquez', ip: '10.0.4.41', dev: 'Linux · Firefox', start: '2026-05-05 09:18', last: '2026-05-05 09:18' },
              ].map((s, i) => (
                <tr key={i}>
                  <td>@{s.u}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{s.ip}</td>
                  <td>{s.dev}</td>
                  <td className="muted mono" style={{ fontSize: 11.5 }}>{s.start}</td>
                  <td className="muted mono" style={{ fontSize: 11.5 }}>{s.last}</td>
                  <td><button className="btn btn-sm btn-danger">Cerrar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ---------- Configuracion ----------
const PageConfiguracion = () => (
  <div className="content-narrow" data-screen-label="configuracion" style={{ maxWidth: 920 }}>
    <PageHead eyebrow="Administración" title="Configuración del sistema"
      sub="Folios, plantillas legales y parámetros globales del Gestor de Resguardos."/>
    <div className="col gap-4">
      <div className="card card-pad">
        <div className="section-title" style={{ marginBottom: 12 }}>Folios</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="field"><span>Prefijo de resguardo</span><input className="input mono" defaultValue="RG-{YYYY}-{####}"/></label>
          <label className="field"><span>Prefijo de bien</span><input className="input mono" defaultValue="BN-{YYYY}-{#####}"/></label>
          <label className="field"><span>Siguiente folio</span><input className="input mono" defaultValue="0214"/></label>
          <label className="field"><span>Año fiscal</span><input className="input mono" defaultValue="2026"/></label>
        </div>
      </div>

      <div className="card card-pad">
        <div className="section-title" style={{ marginBottom: 12 }}>Textos legales de la carta</div>
        <label className="field"><span>Encabezado institucional</span>
          <input className="input" defaultValue="Gobierno del Estado · Secretaría de Innovación"/></label>
        <label className="field" style={{ marginTop: 10 }}><span>Cláusulas</span>
          <textarea className="input" style={{ height: 120, padding: 10 }} defaultValue="1. Resguardar los bienes en las instalaciones autorizadas...&#10;2. Reportar inmediatamente cualquier robo, extravío o daño...&#10;3. Cubrir los costos de reparación o reposición..."/></label>
      </div>

      <div className="card card-pad">
        <div className="section-title" style={{ marginBottom: 12 }}>Parámetros globales</div>
        <div className="col gap-3">
          {[
            { l: 'Días para considerar devolución vencida', v: '90' },
            { l: 'Notificar al responsable cada N días', v: '30' },
            { l: 'Bloquear bajas sin firma electrónica', v: 'Sí' },
            { l: 'Permitir resguardos sin departamento', v: 'No' },
          ].map((row, i) => (
            <div key={i} className="row" style={{ justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--line-1)', borderRadius: 6, background: 'var(--bg-1)' }}>
              <span style={{ fontSize: 13 }}>{row.l}</span>
              <input className="input mono" style={{ width: 100, height: 30 }} defaultValue={row.v}/>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <div className="section-title" style={{ marginBottom: 12 }}>Salud del servicio</div>
        <div className="row gap-3">
          {[
            { l: 'API', s: 'OK', v: '142 ms' },
            { l: 'Base de datos', s: 'OK', v: '8 ms' },
            { l: 'Almacenamiento', s: 'OK', v: '38% usado' },
            { l: 'Cola de firmas', s: 'OK', v: '2 pendientes' },
          ].map((s, i) => (
            <div key={i} className="card card-pad" style={{ flex: 1, background: 'var(--bg-1)' }}>
              <div className="row gap-2"><span className="dot ok"/><span style={{ fontSize: 12, fontWeight: 500 }}>{s.l}</span></div>
              <div className="tnum mono" style={{ fontSize: 14, marginTop: 6 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ---------- Portal ----------
const PagePortal = () => {
  const me = empleadoById('EMP-00942');
  const myAsg = ASIGNACIONES.filter(a => a.empleado === me.id);
  return (
    <div className="content-narrow" data-screen-label="portal" style={{ maxWidth: 980 }}>
      <div className="card card-pad" style={{ marginBottom: 18, background: `linear-gradient(135deg, var(--bg-2), var(--accent-soft))`, borderColor: 'var(--accent-line)' }}>
        <div className="row gap-3">
          <div className="avatar avatar-lg" style={{ width: 56, height: 56, fontSize: 16, background: 'var(--accent)', color: '#07120b', borderColor: 'var(--accent)' }}>{initialsOf(me.nombre, me.apellidos)}</div>
          <div className="col flex-1" style={{ gap: 4 }}>
            <span className="muted" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Portal del empleado</span>
            <h2 style={{ fontSize: 22 }}>Hola, {me.nombre} 👋</h2>
            <span className="muted" style={{ fontSize: 13 }}>{me.puesto} · {orgById(me.org)?.nombre}</span>
          </div>
          <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
            <span className="muted" style={{ fontSize: 11 }}>Bienes bajo tu resguardo</span>
            <span className="tnum" style={{ fontSize: 32, fontWeight: 600 }}>{me.activos}</span>
          </div>
        </div>
      </div>

      <PageHead title="Mis bienes" sub="Bienes que tienes actualmente bajo resguardo activo." actions={<button className="btn"><I.Download size={14}/>Descargar carta</button>}/>
      <div className="cards-grid" style={{ marginBottom: 24 }}>
        {BIENES.filter(b => b.asignado === me.id).map(b => (
          <div key={b.id} className="card card-pad">
            <div className="row gap-2" style={{ marginBottom: 10 }}>
              <div className="thumb" style={{ width: 36, height: 36 }}><I.Box size={14}/></div>
              <div className="col flex-1" style={{ gap: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{b.desc}</span>
                <span className="dim mono" style={{ fontSize: 11 }}>{b.id}</span>
              </div>
              <StatusChip value={b.condicion}/>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>{b.marca} · {b.modelo}</div>
            <div className="dim mono" style={{ fontSize: 11, marginTop: 4 }}>S/N: {b.serie}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: 10 }}>Mis documentos</h2>
      <div className="card" style={{ overflow: 'hidden' }}>
        {myAsg.map(a => (
          <div key={a.id} className="row gap-3" style={{ padding: 14, borderBottom: '1px solid var(--line-1)' }}>
            <I.File size={20}/>
            <div className="col flex-1" style={{ gap: 1 }}>
              <span style={{ fontSize: 13.5 }}>Carta-Responsiva {a.folio}</span>
              <span className="dim" style={{ fontSize: 12 }}>{a.bienes.length} bien(es) · {a.fechaInicio}</span>
            </div>
            <StatusChip value={a.estado}/>
            <button className="btn btn-sm"><I.Download size={13}/>Descargar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Perfil ----------
const PagePerfil = () => {
  const me = empleadoById('EMP-00942');
  return (
    <div className="content-narrow" data-screen-label="perfil" style={{ maxWidth: 760 }}>
      <PageHead eyebrow="Empleado" title="Mi perfil" sub="Gestiona tu cuenta, contraseña y token de API."/>
      <div className="col gap-4">
        <div className="card card-pad">
          <div className="row gap-3" style={{ marginBottom: 16 }}>
            <div className="avatar avatar-lg" style={{ width: 64, height: 64, fontSize: 18 }}>{initialsOf(me.nombre, me.apellidos)}</div>
            <div className="col flex-1" style={{ gap: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{me.nombre} {me.apellidos}</div>
              <div className="muted">{me.puesto}</div>
              <span className="chip accent" style={{ width: 'fit-content' }}>{orgById(me.org)?.siglas}</span>
            </div>
            <button className="btn"><I.Upload size={14}/>Cambiar foto</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label className="field"><span>Nombre</span><input className="input" defaultValue={me.nombre}/></label>
            <label className="field"><span>Apellidos</span><input className="input" defaultValue={me.apellidos}/></label>
            <label className="field"><span>Correo</span><input className="input" defaultValue={me.correo}/></label>
            <label className="field"><span>Teléfono</span><input className="input mono" defaultValue={me.telefono}/></label>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title" style={{ marginBottom: 12 }}>Seguridad</div>
          <div className="col gap-3">
            <div className="row" style={{ justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--line-1)', borderRadius: 6, background: 'var(--bg-1)' }}>
              <div className="col" style={{ gap: 0 }}>
                <span style={{ fontSize: 13 }}>Contraseña</span>
                <span className="dim" style={{ fontSize: 11.5 }}>Última actualización hace 38 días</span>
              </div>
              <button className="btn btn-sm"><I.Lock size={13}/>Cambiar</button>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--line-1)', borderRadius: 6, background: 'var(--bg-1)' }}>
              <div className="col" style={{ gap: 0 }}>
                <span style={{ fontSize: 13 }}>Token de API (Shield)</span>
                <span className="dim mono" style={{ fontSize: 11.5 }}>shld_••••••••2f48 · expira 2026-08-12</span>
              </div>
              <button className="btn btn-sm"><I.Refresh size={13}/>Rotar</button>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--line-1)', borderRadius: 6, background: 'var(--bg-1)' }}>
              <div className="col" style={{ gap: 0 }}>
                <span style={{ fontSize: 13 }}>Autenticación de dos factores</span>
                <span className="dim" style={{ fontSize: 11.5 }}>Recomendado para todos los usuarios</span>
              </div>
              <button className="btn btn-primary btn-sm"><I.Shield size={13}/>Activar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Login ----------
const PageLogin = ({ onEnter }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-0)' }} data-screen-label="login">
      <div style={{ padding: '48px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="row gap-3">
          <div className="brand-mark">G</div>
          <div className="col" style={{ gap: 0 }}>
            <div className="brand-text">Gestor de Resguardos</div>
            <div className="brand-sub">Secretaría de Innovación · v2.4</div>
          </div>
        </div>
        <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Iniciar sesión</h1>
          <div className="muted" style={{ fontSize: 14, marginBottom: 28 }}>Accede con tu cuenta institucional para gestionar bienes, asignaciones y resguardos.</div>
          <div className="col gap-3">
            <label className="field"><span>Usuario o correo</span>
              <input className="input" defaultValue="mtorres" autoFocus/>
            </label>
            <label className="field"><span>Contraseña</span>
              <div className="field-wrap">
                <input className="input" type={show ? 'text' : 'password'} defaultValue="••••••••••••" style={{ paddingRight: 40 }}/>
                <button onClick={() => setShow(!show)} className="btn-ghost" style={{ position: 'absolute', right: 4, top: 4, height: 30, width: 30, display: 'grid', placeItems: 'center', borderRadius: 4 }}>{show ? <I.EyeOff size={14}/> : <I.Eye size={14}/>}</button>
              </div>
            </label>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 12.5 }}>
              <label className="row gap-2" style={{ cursor: 'pointer' }}><input type="checkbox" className="cb" defaultChecked/>Recordar mi sesión</label>
              <span className="linkish">¿Olvidaste tu contraseña?</span>
            </div>
            <button className="btn btn-primary" style={{ height: 44, justifyContent: 'center', marginTop: 8 }} onClick={onEnter}><I.ArrowRight size={14}/>Entrar</button>
            <div className="row gap-2" style={{ alignItems: 'center', margin: '12px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line-1)' }}/>
              <span className="dim" style={{ fontSize: 11 }}>O CONTINÚA CON</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line-1)' }}/>
            </div>
            <button className="btn" style={{ height: 44, justifyContent: 'center' }}><I.Key size={14}/>e.firma SAT</button>
          </div>
        </div>
        <div className="dim" style={{ fontSize: 11.5 }}>© 2026 Gobierno del Estado · Servicio en línea acceso seguro</div>
      </div>
      <div style={{ background: 'linear-gradient(155deg, #0a110d 0%, #14201b 30%, #1b3525 100%)', position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center', padding: 60 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }} preserveAspectRatio="none" viewBox="0 0 600 800">
          <defs>
            <radialGradient id="g1" cx="50%" cy="30%" r="50%"><stop offset="0%" stopColor="#4ade80" stopOpacity="0.35"/><stop offset="100%" stopColor="#4ade80" stopOpacity="0"/></radialGradient>
          </defs>
          <rect width="600" height="800" fill="url(#g1)"/>
          {Array.from({length: 30}).map((_, i) => (
            <line key={i} x1={i * 40 - 100} y1="0" x2={i * 40 + 100} y2="800" stroke="rgba(74,222,128,0.05)"/>
          ))}
          {Array.from({length: 20}).map((_, i) => (
            <line key={'h'+i} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="rgba(74,222,128,0.04)"/>
          ))}
        </svg>
        <div style={{ position: 'relative', maxWidth: 420, color: '#e7eee8' }}>
          <div className="row gap-2" style={{ marginBottom: 20 }}>
            <I.Sparkle size={18} stroke="var(--accent)"/>
            <span style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Modernización</span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.02em' }}>Control patrimonial transparente, ágil y firmado digitalmente.</h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 28 }}>Gestiona el ciclo completo de los bienes: alta, asignación, transferencia, devolución y baja — con bitácora íntegra y reportes auditables.</p>
          <div className="card card-pad" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(74,222,128,0.18)', backdropFilter: 'blur(8px)' }}>
            <div className="row gap-3">
              <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center' }}><I.Shield size={20} stroke="var(--accent)"/></div>
              <div className="col" style={{ gap: 0, flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>1,207 bienes resguardados</span>
                <span className="muted" style={{ fontSize: 12 }}>318 empleados · 5 organizaciones · 100% bitácora íntegra</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PageEmpleados, PageOrganizaciones, PageDepartamentos, PageReportes, PageUsuarios, PageConfiguracion, PagePortal, PagePerfil, PageLogin });
