// Bienes (Goods) page + detail drawer

const PageBienes = () => {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = BIENES.filter(b => {
    if (filter === 'asignados' && b.estado !== 'Asignado') return false;
    if (filter === 'disponibles' && b.estado !== 'Disponible') return false;
    if (filter === 'mantenimiento' && b.estado !== 'Mantenimiento') return false;
    if (search && !`${b.id} ${b.desc} ${b.marca} ${b.modelo}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="content-narrow" data-screen-label="bienes">
      <PageHead
        eyebrow="Inventario"
        title="Bienes"
        sub={`${BIENES.length} bienes registrados — 412 cómputo · 286 mobiliario · 134 telecom · 28 vehículos`}
        actions={<>
          <button className="btn"><I.Upload size={14}/>Importar</button>
          <button className="btn"><I.Download size={14}/>Exportar Excel</button>
          <button className="btn"><I.Print size={14}/>Inventario PDF</button>
          <button className="btn btn-primary"><I.Plus size={14}/>Nuevo bien</button>
        </>}
      />

      <div className="toolbar">
        <div className="seg">
          {[
            { k: 'todos', l: `Todos · ${BIENES.length}` },
            { k: 'asignados', l: `Asignados · ${BIENES.filter(b => b.estado === 'Asignado').length}` },
            { k: 'disponibles', l: `Disponibles · ${BIENES.filter(b => b.estado === 'Disponible').length}` },
            { k: 'mantenimiento', l: `Mantenimiento · ${BIENES.filter(b => b.estado === 'Mantenimiento').length}` },
          ].map(t => (
            <button key={t.k} className={filter === t.k ? 'active' : ''} onClick={() => setFilter(t.k)}>{t.l}</button>
          ))}
        </div>
        <div className="searchbox" style={{ flex: '0 0 280px' }}>
          <I.Search size={14} className="ico-left"/>
          <input className="input input-search" placeholder="Folio, descripción, serie…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <button className="btn btn-sm"><I.Filter size={13}/>Categoría</button>
        <button className="btn btn-sm"><I.Filter size={13}/>Ubicación</button>
        <button className="btn btn-sm"><I.Filter size={13}/>Año</button>
        <div className="spacer"/>
        <span className="muted" style={{ fontSize: 12 }}>{filtered.length} resultados</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36 }}><input type="checkbox" className="cb"/></th>
              <th>Folio / Serie</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Ubicación</th>
              <th>Asignado a</th>
              <th>Estado</th>
              <th className="col-num">Costo</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(b => {
              const cat = catById(b.categoria);
              const ubi = ubiById(b.ubicacion);
              const emp = b.asignado ? empleadoById(b.asignado) : null;
              return (
                <tr key={b.id} onClick={() => setSelected(b)}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" className="cb"/></td>
                  <td>
                    <div className="col" style={{ gap: 2 }}>
                      <span className="mono" style={{ fontSize: 12 }}>{b.id}</span>
                      <span className="dim mono" style={{ fontSize: 11 }}>{b.serie}</span>
                    </div>
                  </td>
                  <td>
                    <div className="col" style={{ gap: 1 }}>
                      <span style={{ fontWeight: 500 }}>{b.desc}</span>
                      <span className="dim" style={{ fontSize: 11.5 }}>{b.marca} · {b.modelo}</span>
                    </div>
                  </td>
                  <td className="muted">{cat?.nombre}</td>
                  <td className="muted">{ubi?.codigo}</td>
                  <td>
                    {emp ? (
                      <div className="row gap-2">
                        <div className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>{initialsOf(emp.nombre, emp.apellidos)}</div>
                        <span style={{ fontSize: 12.5 }}>{emp.nombre} {emp.apellidos.split(' ')[0]}</span>
                      </div>
                    ) : <span className="dim">—</span>}
                  </td>
                  <td><StatusChip value={b.estado}/></td>
                  <td className="col-num tnum mono" style={{ fontSize: 12.5 }}>{fmtMXN(b.costo)}</td>
                  <td onClick={e => e.stopPropagation()}><button className="btn btn-icon btn-sm btn-ghost"><I.More size={14}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pager page={page} total={filtered.length} perPage={perPage} onChange={setPage}/>
      </div>

      <BienDrawer bien={selected} onClose={() => setSelected(null)}/>
    </div>
  );
};

const BienDrawer = ({ bien, onClose }) => {
  const [tab, setTab] = useState('info');
  if (!bien) return null;
  const cat = catById(bien.categoria);
  const ubi = ubiById(bien.ubicacion);
  const emp = bien.asignado ? empleadoById(bien.asignado) : null;
  return (
    <Drawer
      open={!!bien}
      onClose={onClose}
      eyebrow={bien.id}
      title={bien.desc}
      footer={<>
        <button className="btn"><I.Edit size={14}/>Editar</button>
        <button className="btn btn-danger"><I.Trash size={14}/>Dar de baja</button>
        <div className="flex-1"/>
        <button className="btn btn-primary"><I.ArrowLeftRight size={14}/>Asignar / Transferir</button>
      </>}
    >
      <div className="row gap-3" style={{ marginBottom: 18 }}>
        <div className="thumb" style={{ width: 96, height: 96 }}><I.Box size={32}/></div>
        <div className="col flex-1" style={{ gap: 6 }}>
          <div className="row gap-2"><StatusChip value={bien.estado}/><StatusChip value={bien.condicion}/><span className="chip">{cat?.nombre}</span></div>
          <div style={{ fontSize: 13 }}><span className="muted">Marca / modelo: </span>{bien.marca} <span className="dim">·</span> {bien.modelo}</div>
          <div style={{ fontSize: 13 }}><span className="muted">No. de serie: </span><span className="mono">{bien.serie}</span></div>
        </div>
        <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
          <span className="muted" style={{ fontSize: 11 }}>Costo de adquisición</span>
          <span className="tnum mono" style={{ fontSize: 22, fontWeight: 600 }}>{fmtMXN(bien.costo)}</span>
          <span className="muted" style={{ fontSize: 11 }}>Adq. {bien.fecha}</span>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[['info','Información'],['movimientos','Movimientos'],['adjuntos','Adjuntos'],['historial','Historial']].map(([k, l]) => (
          <div key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab === 'info' && (
        <div className="col gap-4">
          <div className="card card-pad">
            <div className="section-title" style={{ marginBottom: 10 }}>Asignación actual</div>
            {emp ? (
              <div className="row gap-3">
                <div className="avatar avatar-lg">{initialsOf(emp.nombre, emp.apellidos)}</div>
                <div className="col flex-1" style={{ gap: 2 }}>
                  <div style={{ fontWeight: 500 }}>{emp.nombre} {emp.apellidos}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{emp.puesto} · {orgById(emp.org)?.siglas}</div>
                  <div className="dim mono" style={{ fontSize: 11.5 }}>{emp.id} · {emp.correo}</div>
                </div>
                <button className="btn btn-sm">Ver carta</button>
              </div>
            ) : <div className="muted">Sin asignación. Disponible para resguardo.</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DataField label="Categoría" value={cat?.nombre}/>
            <DataField label="Ubicación física" value={ubi?.nombre}/>
            <DataField label="Marca" value={bien.marca}/>
            <DataField label="Modelo" value={bien.modelo}/>
            <DataField label="No. de serie" value={bien.serie} mono/>
            <DataField label="Folio interno" value={bien.id} mono/>
            <DataField label="Condición" value={bien.condicion}/>
            <DataField label="Fecha de adquisición" value={bien.fecha} mono/>
          </div>
        </div>
      )}

      {tab === 'movimientos' && (
        <div className="timeline">
          {[
            { fecha: '2024-08-12', titulo: 'Movido a Edificio B — Sala TI', desc: 'Cambio de ubicación operativa.', actor: 'Roberto Mendoza', sev: 'warn' },
            { fecha: '2024-02-15', titulo: 'Asignado a Patricia Solís', desc: 'Resguardo RG-2024-0482 firmado digitalmente.', actor: 'María Elena Torres', sev: 'accent' },
            { fecha: '2024-02-14', titulo: 'Alta en inventario', desc: 'Recepción de proveedor Dell — pedido PO-2024-0089.', actor: 'Manuel Aguirre', sev: 'accent' },
          ].map((e, i) => (
            <div key={i} className={`tl-item ${e.sev}`}>
              <div className="tl-dot"/>
              <div className="tl-time mono">{e.fecha}</div>
              <div className="tl-title">{e.titulo}</div>
              <div className="tl-desc">{e.desc} <span className="dim">— {e.actor}</span></div>
            </div>
          ))}
        </div>
      )}

      {tab === 'adjuntos' && (
        <div className="col gap-2">
          {[
            { nombre: 'factura-dell-2024-PO-0089.pdf', tipo: 'Factura', tam: '184 KB' },
            { nombre: 'foto-equipo-frontal.jpg', tipo: 'Fotografía', tam: '2.1 MB' },
            { nombre: 'manual-latitude-5450.pdf', tipo: 'Manual', tam: '4.6 MB' },
          ].map((f, i) => (
            <div key={i} className="row gap-3" style={{ padding: 12, border: '1px solid var(--line-1)', borderRadius: 8, background: 'var(--bg-1)' }}>
              <I.File size={18}/>
              <div className="col flex-1" style={{ gap: 1 }}>
                <span style={{ fontSize: 13 }}>{f.nombre}</span>
                <span className="dim" style={{ fontSize: 11.5 }}>{f.tipo} · {f.tam}</span>
              </div>
              <button className="btn btn-sm btn-ghost btn-icon"><I.Download size={14}/></button>
            </div>
          ))}
          <button className="btn" style={{ alignSelf: 'flex-start' }}><I.Paperclip size={14}/>Adjuntar archivo</button>
        </div>
      )}

      {tab === 'historial' && (
        <div className="col gap-2">
          <div className="muted" style={{ fontSize: 12 }}>Bitácora completa de cambios para este bien.</div>
          <table className="table">
            <thead><tr><th>Fecha</th><th>Acción</th><th>Usuario</th></tr></thead>
            <tbody>
              {[
                ['2024-08-12 11:32', 'bien.actualizar', 'rmendoza'],
                ['2024-02-15 14:09', 'asignacion.firmar', 'psolis'],
                ['2024-02-14 09:18', 'bien.crear', 'mtorres'],
              ].map((r, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontSize: 12 }}>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td className="muted">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Drawer>
  );
};

const DataField = ({ label, value, mono }) => (
  <div className="col" style={{ gap: 2, padding: 10, border: '1px solid var(--line-1)', borderRadius: 6, background: 'var(--bg-1)' }}>
    <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    <span className={mono ? 'mono' : ''} style={{ fontSize: 13 }}>{value || '—'}</span>
  </div>
);

Object.assign(window, { PageBienes, DataField });
