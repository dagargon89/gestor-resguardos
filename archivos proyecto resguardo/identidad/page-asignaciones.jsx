// Asignaciones page: list + new wizard + carta preview + transfer/cancel/timeline

const PageAsignaciones = () => {
  const [selected, setSelected] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [cartaOpen, setCartaOpen] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [search, setSearch] = useState('');

  const filtered = ASIGNACIONES.filter(a => {
    if (filter === 'activas' && a.estado !== 'Activa') return false;
    if (filter === 'devueltas' && a.estado !== 'Devuelta') return false;
    if (filter === 'canceladas' && a.estado !== 'Cancelada') return false;
    if (search && !`${a.folio} ${a.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="content-narrow" data-screen-label="asignaciones">
      <PageHead
        eyebrow="Inventario"
        title="Asignaciones"
        sub="Resguardos y préstamos activos. Historial completo con eventos y firmas."
        actions={<>
          <button className="btn"><I.Download size={14}/>Exportar</button>
          <button className="btn btn-primary" onClick={() => setWizardOpen(true)}><I.Plus size={14}/>Nueva asignación</button>
        </>}
      />

      <div className="toolbar">
        <div className="seg">
          {[
            { k: 'todas', l: `Todas · ${ASIGNACIONES.length}` },
            { k: 'activas', l: `Activas · ${ASIGNACIONES.filter(a => a.estado === 'Activa').length}` },
            { k: 'devueltas', l: `Devueltas · ${ASIGNACIONES.filter(a => a.estado === 'Devuelta').length}` },
            { k: 'canceladas', l: `Canceladas · ${ASIGNACIONES.filter(a => a.estado === 'Cancelada').length}` },
          ].map(t => <button key={t.k} className={filter === t.k ? 'active' : ''} onClick={() => setFilter(t.k)}>{t.l}</button>)}
        </div>
        <div className="searchbox" style={{ flex: '0 0 280px' }}>
          <I.Search size={14} className="ico-left"/>
          <input className="input input-search" placeholder="Folio, empleado, RFC…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <button className="btn btn-sm"><I.Filter size={13}/>Tipo</button>
        <button className="btn btn-sm"><I.Calendar size={13}/>Rango de fechas</button>
        <div className="spacer"/>
        <span className="muted" style={{ fontSize: 12 }}>{filtered.length} resultados</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Empleado</th>
              <th>Bienes</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Devolución</th>
              <th>Firma</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const e = empleadoById(a.empleado);
              return (
                <tr key={a.id} onClick={() => setSelected(a)}>
                  <td className="mono" style={{ fontSize: 12.5, color: 'var(--text-1)' }}>{a.folio}</td>
                  <td>
                    <div className="row gap-2">
                      <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{initialsOf(e.nombre, e.apellidos)}</div>
                      <div className="col" style={{ gap: 0 }}>
                        <span style={{ fontSize: 13 }}>{e.nombre} {e.apellidos.split(' ')[0]}</span>
                        <span className="dim" style={{ fontSize: 11 }}>{orgById(e.org)?.siglas}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="tag">{a.bienes.length}</span></td>
                  <td className="muted">{a.tipo}</td>
                  <td><StatusChip value={a.estado}/></td>
                  <td className="muted tnum mono" style={{ fontSize: 12 }}>{a.fechaInicio}</td>
                  <td className="muted tnum mono" style={{ fontSize: 12 }}>{a.fechaFin || '—'}</td>
                  <td>{a.firmada ? <I.CheckCircle size={16} stroke="var(--accent)"/> : <I.Clock size={16} stroke="var(--warn)"/>}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row gap-2">
                      <button className="btn btn-icon btn-sm btn-ghost" data-tip="Ver carta" onClick={() => setCartaOpen(a)}><I.File size={13}/></button>
                      <button className="btn btn-icon btn-sm btn-ghost"><I.More size={13}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AsignacionDrawer asg={selected} onClose={() => setSelected(null)} onCarta={(a) => { setSelected(null); setCartaOpen(a); }}/>
      {wizardOpen && <NuevaAsignacionWizard onClose={() => setWizardOpen(false)}/>}
      {cartaOpen && <CartaPreview asg={cartaOpen} onClose={() => setCartaOpen(null)}/>}
    </div>
  );
};

const AsignacionDrawer = ({ asg, onClose, onCarta }) => {
  const [tab, setTab] = useState('detalle');
  const [actionModal, setActionModal] = useState(null);
  if (!asg) return null;
  const e = empleadoById(asg.empleado);
  const totalCosto = asg.bienes.reduce((s, id) => s + (bienById(id)?.costo || 0), 0);

  return (
    <Drawer
      open={!!asg}
      onClose={onClose}
      eyebrow={`${asg.tipo} · ${asg.id}`}
      title={asg.folio}
      width={760}
      footer={<>
        <button className="btn" onClick={() => onCarta(asg)}><I.File size={14}/>Carta</button>
        <button className="btn"><I.Print size={14}/>Imprimir</button>
        <div className="flex-1"/>
        {asg.estado === 'Activa' && <>
          <button className="btn" onClick={() => setActionModal('transferir')}><I.ArrowLeftRight size={14}/>Transferir</button>
          <button className="btn btn-danger" onClick={() => setActionModal('cancelar')}><I.XCircle size={14}/>Cancelar</button>
          <button className="btn btn-primary" onClick={() => setActionModal('devolver')}><I.CheckCircle size={14}/>Marcar devolución</button>
        </>}
      </>}
    >
      <div className="row gap-3" style={{ marginBottom: 18 }}>
        <div className="avatar avatar-lg" style={{ width: 56, height: 56, fontSize: 16 }}>{initialsOf(e.nombre, e.apellidos)}</div>
        <div className="col flex-1" style={{ gap: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{e.nombre} {e.apellidos}</div>
          <div className="muted" style={{ fontSize: 13 }}>{e.puesto} · {orgById(e.org)?.nombre}</div>
          <div className="row gap-2" style={{ marginTop: 4 }}>
            <StatusChip value={asg.estado}/>
            <span className="chip">{asg.tipo}</span>
            {asg.firmada ? <span className="chip ok"><I.Check size={11}/>Firmada</span> : <span className="chip warn"><I.Clock size={11}/>Sin firma</span>}
          </div>
        </div>
        <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
          <span className="muted" style={{ fontSize: 11 }}>Total resguardado</span>
          <span className="tnum mono" style={{ fontSize: 22, fontWeight: 600 }}>{fmtMXN(totalCosto)}</span>
          <span className="muted" style={{ fontSize: 11 }}>{asg.bienes.length} {asg.bienes.length === 1 ? 'bien' : 'bienes'}</span>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[['detalle','Detalle'],['bienes',`Bienes (${asg.bienes.length})`],['eventos','Eventos'],['documentos','Documentos']].map(([k, l]) => (
          <div key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab === 'detalle' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <DataField label="Folio" value={asg.folio} mono/>
          <DataField label="ID interno" value={asg.id} mono/>
          <DataField label="Empleado" value={`${e.nombre} ${e.apellidos}`}/>
          <DataField label="RFC" value={e.rfc} mono/>
          <DataField label="Puesto" value={e.puesto}/>
          <DataField label="Organización" value={orgById(e.org)?.nombre}/>
          <DataField label="Departamento" value={DEPTOS.find(d => d.id === e.dep)?.nombre}/>
          <DataField label="Tipo de asignación" value={asg.tipo}/>
          <DataField label="Fecha de inicio" value={asg.fechaInicio} mono/>
          <DataField label="Fecha de devolución" value={asg.fechaFin || 'Sin devolver'} mono/>
        </div>
      )}

      {tab === 'bienes' && (
        <div className="col gap-2">
          {asg.bienes.map(bid => {
            const b = bienById(bid);
            if (!b) return null;
            return (
              <div key={bid} className="row gap-3" style={{ padding: 12, border: '1px solid var(--line-1)', borderRadius: 8, background: 'var(--bg-1)' }}>
                <div className="thumb" style={{ width: 48, height: 48 }}><I.Box size={18}/></div>
                <div className="col flex-1" style={{ gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{b.desc}</span>
                  <span className="dim mono" style={{ fontSize: 11.5 }}>{b.id} · {b.serie}</span>
                </div>
                <span className="tnum mono" style={{ fontSize: 13 }}>{fmtMXN(b.costo)}</span>
                <StatusChip value={b.condicion}/>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'eventos' && (
        <div className="timeline">
          {EVENTOS.map((ev, i) => (
            <div key={i} className={`tl-item ${ev.sev}`}>
              <div className="tl-dot"/>
              <div className="tl-time mono">{ev.fecha}</div>
              <div className="tl-title">{ev.titulo}</div>
              <div className="tl-desc">{ev.desc} <span className="dim">— {ev.actor}</span></div>
            </div>
          ))}
        </div>
      )}

      {tab === 'documentos' && (
        <div className="col gap-2">
          {[
            { nombre: `carta-resguardo-${asg.folio}.pdf`, tipo: 'Carta de resguardo', tam: '124 KB', firmado: true },
            { nombre: `acuse-firma-${asg.folio}.pdf`, tipo: 'Acuse de firma', tam: '38 KB', firmado: true },
          ].map((f, i) => (
            <div key={i} className="row gap-3" style={{ padding: 12, border: '1px solid var(--line-1)', borderRadius: 8, background: 'var(--bg-1)' }}>
              <I.File size={18}/>
              <div className="col flex-1" style={{ gap: 1 }}>
                <span style={{ fontSize: 13 }}>{f.nombre}</span>
                <span className="dim" style={{ fontSize: 11.5 }}>{f.tipo} · {f.tam}</span>
              </div>
              {f.firmado && <span className="chip ok"><I.Check size={11}/>Firmado</span>}
              <button className="btn btn-sm btn-ghost btn-icon"><I.Download size={14}/></button>
            </div>
          ))}
        </div>
      )}

      {actionModal && <AccionAsignacion type={actionModal} asg={asg} onClose={() => setActionModal(null)}/>}
    </Drawer>
  );
};

const AccionAsignacion = ({ type, asg, onClose }) => {
  const cfg = {
    devolver: { title: 'Marcar devolución', desc: 'Confirma la devolución física de los bienes y registra el evento en bitácora.', primary: 'Confirmar devolución', cls: 'btn-primary', icon: 'CheckCircle' },
    transferir: { title: 'Transferir asignación', desc: 'Cambiar al empleado que tiene los bienes bajo resguardo. Se generará una nueva carta.', primary: 'Generar transferencia', cls: 'btn-primary', icon: 'ArrowLeftRight' },
    cancelar: { title: 'Cancelar asignación', desc: 'Esta acción anula el resguardo y libera los bienes. Los eventos quedarán registrados.', primary: 'Sí, cancelar', cls: 'btn-danger', icon: 'XCircle' },
  }[type];
  const Ic = I[cfg.icon];
  return (
    <Modal open onClose={onClose} title={cfg.title} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button className={`btn ${cfg.cls}`} onClick={onClose}><Ic size={14}/>{cfg.primary}</button>
    </>}>
      <div className="muted" style={{ marginBottom: 16 }}>{cfg.desc}</div>
      {type === 'transferir' && (
        <div className="col gap-3">
          <label className="field"><span>Nuevo empleado</span>
            <select className="select">
              {EMPLEADOS.filter(e => e.id !== asg.empleado).map(e => <option key={e.id}>{e.nombre} {e.apellidos} — {orgById(e.org)?.siglas}</option>)}
            </select>
          </label>
          <label className="field"><span>Motivo</span><textarea className="input" style={{ height: 80, padding: 10 }} placeholder="Cambio de adscripción, vacaciones, etc."/></label>
        </div>
      )}
      {type === 'devolver' && (
        <div className="col gap-3">
          <div className="row gap-2"><input type="checkbox" className="cb" defaultChecked/><span>Bienes recibidos en buen estado</span></div>
          <div className="row gap-2"><input type="checkbox" className="cb"/><span>Requiere mantenimiento o revisión</span></div>
          <label className="field"><span>Observaciones</span><textarea className="input" style={{ height: 80, padding: 10 }} placeholder="Notas opcionales sobre la devolución"/></label>
        </div>
      )}
      {type === 'cancelar' && (
        <div className="card card-pad" style={{ background: 'var(--danger-soft)', borderColor: 'rgba(239,111,111,0.3)' }}>
          <div className="row gap-2"><I.AlertTri size={16} stroke="var(--danger)"/><b>Esta acción no se puede deshacer.</b></div>
          <div style={{ marginTop: 8, fontSize: 13 }}>Folio <span className="mono">{asg.folio}</span> con {asg.bienes.length} bien(es) será marcado como cancelado.</div>
        </div>
      )}
    </Modal>
  );
};

// ---------- Wizard ----------
const NuevaAsignacionWizard = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ tipo: 'Resguardo', empleado: null, bienes: [], notas: '' });

  const STEPS = ['Empleado', 'Bienes', 'Detalles', 'Confirmación'];

  const advance = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow="Nueva asignación"
      title="Crear resguardo"
      width={840}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <div className="flex-1"/>
        {step > 0 && <button className="btn" onClick={back}><I.ArrowLeft size={14}/>Atrás</button>}
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={advance} disabled={(step === 0 && !data.empleado) || (step === 1 && data.bienes.length === 0)}>Continuar<I.ArrowRight size={14}/></button>
        ) : (
          <button className="btn btn-primary" onClick={onClose}><I.Send size={14}/>Generar y enviar a firma</button>
        )}
      </>}
    >
      <div className="steps" style={{ marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-bubble">{i < step ? <I.Check size={12}/> : i + 1}</div>
              <span>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`step-bar ${i < step ? 'done' : ''}`}/>}
          </React.Fragment>
        ))}
      </div>

      {step === 0 && <WizardStepEmpleado data={data} onChange={setData}/>}
      {step === 1 && <WizardStepBienes data={data} onChange={setData}/>}
      {step === 2 && <WizardStepDetalles data={data} onChange={setData}/>}
      {step === 3 && <WizardStepConfirm data={data}/>}
    </Drawer>
  );
};

const WizardStepEmpleado = ({ data, onChange }) => {
  const [q, setQ] = useState('');
  const list = EMPLEADOS.filter(e => `${e.nombre} ${e.apellidos} ${e.id}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <h3 style={{ marginBottom: 4 }}>¿Quién recibirá los bienes?</h3>
      <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Selecciona al empleado que firmará el resguardo.</div>
      <div className="searchbox" style={{ flex: 1, marginBottom: 12 }}>
        <I.Search size={14} className="ico-left"/>
        <input className="input input-search" placeholder="Buscar por nombre, ID o RFC…" value={q} onChange={e => setQ(e.target.value)} autoFocus/>
      </div>
      <div className="col gap-2" style={{ maxHeight: 320, overflow: 'auto' }}>
        {list.slice(0, 10).map(e => {
          const sel = data.empleado === e.id;
          return (
            <div key={e.id} onClick={() => onChange({ ...data, empleado: e.id })} style={{
              padding: 12, border: `1px solid ${sel ? 'var(--accent-line)' : 'var(--line-1)'}`,
              borderRadius: 8, background: sel ? 'var(--accent-soft)' : 'var(--bg-1)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div className="avatar avatar-lg">{initialsOf(e.nombre, e.apellidos)}</div>
              <div className="col flex-1" style={{ gap: 2 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{e.nombre} {e.apellidos}</div>
                <div className="muted" style={{ fontSize: 12 }}>{e.puesto} · {orgById(e.org)?.siglas}</div>
                <div className="dim mono" style={{ fontSize: 11 }}>{e.id} · {e.rfc}</div>
              </div>
              <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
                <span className="muted" style={{ fontSize: 11 }}>Bienes activos</span>
                <span className="tnum" style={{ fontSize: 16, fontWeight: 600 }}>{e.activos}</span>
              </div>
              {sel && <I.CheckCircle size={20} stroke="var(--accent)"/>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WizardStepBienes = ({ data, onChange }) => {
  const [q, setQ] = useState('');
  const disponibles = BIENES.filter(b => b.estado === 'Disponible' || b.asignado === data.empleado);
  const list = disponibles.filter(b => `${b.id} ${b.desc}`.toLowerCase().includes(q.toLowerCase()));
  // Always offer some recently-assigned items so the demo has bulk content
  const offered = list.length > 0 ? list : BIENES.filter(b => `${b.id} ${b.desc}`.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  const toggle = id => {
    const set = new Set(data.bienes);
    if (set.has(id)) set.delete(id); else set.add(id);
    onChange({ ...data, bienes: [...set] });
  };
  const total = data.bienes.reduce((s, id) => s + (bienById(id)?.costo || 0), 0);
  return (
    <div>
      <h3 style={{ marginBottom: 4 }}>Selecciona los bienes a resguardar</h3>
      <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Puedes incluir bienes disponibles o reasignar de inventario.</div>
      <div className="row gap-3" style={{ marginBottom: 12 }}>
        <div className="searchbox flex-1">
          <I.Search size={14} className="ico-left"/>
          <input className="input input-search" placeholder="Folio, descripción, serie…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="card" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--accent-soft)', borderColor: 'var(--accent-line)' }}>
          <span style={{ fontSize: 12 }} className="muted">Seleccionados</span>
          <span className="tnum" style={{ fontWeight: 600, color: 'var(--accent)' }}>{data.bienes.length}</span>
          <span className="v-divider" style={{ height: 16 }}/>
          <span className="tnum mono" style={{ fontWeight: 600 }}>{fmtMXN(total)}</span>
        </div>
      </div>
      <div className="col gap-2" style={{ maxHeight: 380, overflow: 'auto' }}>
        {offered.slice(0, 12).map(b => {
          const sel = data.bienes.includes(b.id);
          return (
            <div key={b.id} onClick={() => toggle(b.id)} style={{
              padding: 10, border: `1px solid ${sel ? 'var(--accent-line)' : 'var(--line-1)'}`,
              borderRadius: 8, background: sel ? 'var(--accent-soft)' : 'var(--bg-1)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <input type="checkbox" className="cb" checked={sel} onChange={() => {}}/>
              <I.Box size={18} stroke={sel ? 'var(--accent)' : 'var(--text-3)'}/>
              <div className="col flex-1" style={{ gap: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{b.desc}</span>
                <span className="dim mono" style={{ fontSize: 11.5 }}>{b.id} · {b.serie}</span>
              </div>
              <StatusChip value={b.estado}/>
              <span className="tnum mono" style={{ fontSize: 12.5, minWidth: 90, textAlign: 'right' }}>{fmtMXN(b.costo)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WizardStepDetalles = ({ data, onChange }) => (
  <div>
    <h3 style={{ marginBottom: 4 }}>Detalles del resguardo</h3>
    <div className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Configura el tipo y vigencia.</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <label className="field"><span>Tipo de asignación</span>
        <div className="seg" style={{ width: 'fit-content' }}>
          {['Resguardo','Préstamo','Comodato'].map(t => (
            <button key={t} className={data.tipo === t ? 'active' : ''} onClick={() => onChange({...data, tipo: t})}>{t}</button>
          ))}
        </div>
      </label>
      <label className="field"><span>Folio sugerido</span>
        <input className="input mono" value="RG-2026-0214" readOnly/>
      </label>
      <label className="field"><span>Fecha de inicio</span>
        <input className="input mono" defaultValue="2026-05-05"/>
      </label>
      <label className="field"><span>Fecha de devolución <span className="dim">(opcional)</span></span>
        <input className="input mono" placeholder="YYYY-MM-DD"/>
      </label>
      <label className="field" style={{ gridColumn: '1 / -1' }}><span>Notas / observaciones</span>
        <textarea className="input" style={{ height: 90, padding: 10 }} placeholder="Información adicional para la carta-responsiva"/>
      </label>
      <label className="field" style={{ gridColumn: '1 / -1' }}><span>Modo de firma</span>
        <div className="row gap-2">
          {['Firma electrónica (e.firma SAT)','Firma física escaneada','Firma posterior'].map((m, i) => (
            <label key={m} className="row gap-2" style={{ padding: 10, border: `1px solid ${i === 0 ? 'var(--accent-line)' : 'var(--line-1)'}`, borderRadius: 6, flex: 1, background: i === 0 ? 'var(--accent-soft)' : 'var(--bg-1)', cursor: 'pointer' }}>
              <input type="radio" name="firma" defaultChecked={i === 0}/>
              <span style={{ fontSize: 12.5 }}>{m}</span>
            </label>
          ))}
        </div>
      </label>
    </div>
  </div>
);

const WizardStepConfirm = ({ data }) => {
  const e = empleadoById(data.empleado);
  const total = data.bienes.reduce((s, id) => s + (bienById(id)?.costo || 0), 0);
  return (
    <div>
      <h3 style={{ marginBottom: 4 }}>Revisa y confirma</h3>
      <div className="muted" style={{ fontSize: 13, marginBottom: 18 }}>Al continuar se generará la carta y se enviará al empleado para firma.</div>
      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ marginBottom: 10 }}>Resumen</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <DataField label="Empleado" value={e ? `${e.nombre} ${e.apellidos}` : '—'}/>
          <DataField label="Tipo" value={data.tipo}/>
          <DataField label="Folio" value="RG-2026-0214" mono/>
          <DataField label="Fecha de inicio" value="2026-05-05" mono/>
          <DataField label="Bienes incluidos" value={`${data.bienes.length} ${data.bienes.length === 1 ? 'pieza' : 'piezas'}`}/>
          <DataField label="Valor total" value={fmtMXN(total)}/>
        </div>
      </div>
      <div className="card card-pad">
        <div className="section-title" style={{ marginBottom: 10 }}>Bienes</div>
        <div className="col gap-2">
          {data.bienes.map(id => {
            const b = bienById(id);
            return b && (
              <div key={id} className="row gap-2" style={{ fontSize: 13 }}>
                <I.Check size={14} stroke="var(--accent)"/>
                <span>{b.desc}</span>
                <span className="dim mono" style={{ fontSize: 11 }}>· {b.id}</span>
                <div className="flex-1"/>
                <span className="tnum mono" style={{ fontSize: 12 }}>{fmtMXN(b.costo)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------- Carta preview ----------
const CartaPreview = ({ asg, onClose }) => {
  const e = empleadoById(asg.empleado);
  const totalCosto = asg.bienes.reduce((s, id) => s + (bienById(id)?.costo || 0), 0);
  return (
    <>
      <Scrim onClose={onClose}/>
      <div style={{ position: 'fixed', inset: 0, zIndex: 41, display: 'grid', gridTemplateRows: 'auto 1fr', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', height: 56, background: 'var(--bg-1)', borderBottom: '1px solid var(--line-1)', padding: '0 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <I.File size={16}/>
          <div className="col" style={{ gap: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Carta-Responsiva · {asg.folio}</span>
            <span className="dim" style={{ fontSize: 11 }}>{e.nombre} {e.apellidos}</span>
          </div>
          <div className="flex-1"/>
          <button className="btn btn-sm"><I.Print size={13}/>Imprimir</button>
          <button className="btn btn-sm"><I.Download size={13}/>Descargar PDF</button>
          <button className="btn btn-sm"><I.Send size={13}/>Enviar a firma</button>
          <button className="btn btn-sm btn-ghost btn-icon" onClick={onClose}><I.Close size={14}/></button>
        </div>
        <div style={{ pointerEvents: 'auto', overflow: 'auto', padding: 32, background: 'rgba(0,0,0,0.4)' }}>
          <div className="carta-paper" style={{ maxWidth: 820, margin: '0 auto' }}>
            <div className="doc-head">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5e5b51', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gobierno del Estado · Secretaría de Innovación</div>
                <h2 style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>Carta-Responsiva de Resguardo</h2>
                <div className="doc-folio" style={{ marginTop: 6 }}>Folio: {asg.folio} · {asg.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="doc-folio">Fecha de emisión</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>5 de mayo de 2026</div>
              </div>
            </div>

            <p>Por medio del presente documento, el(la) suscrito(a) <b>{e.nombre} {e.apellidos}</b>, con Registro Federal de Contribuyentes <b>{e.rfc}</b>, adscrito(a) a <b>{orgById(e.org)?.nombre}</b> en el puesto de <b>{e.puesto}</b>, recibe en calidad de <b>{asg.tipo.toLowerCase()}</b> los bienes muebles propiedad del Gobierno descritos a continuación, comprometiéndose a su buen uso, conservación y custodia mientras permanezcan bajo su responsabilidad.</p>

            <table className="doc-table">
              <thead><tr><th>Folio</th><th>Descripción</th><th>Marca / Modelo</th><th>No. de serie</th><th style={{ textAlign: 'right' }}>Valor</th></tr></thead>
              <tbody>
                {asg.bienes.map(id => {
                  const b = bienById(id);
                  return b && (
                    <tr key={id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>{b.id}</td>
                      <td>{b.desc}</td>
                      <td>{b.marca} {b.modelo}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>{b.serie}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMXN(b.costo)}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600, background: '#ecebe3' }}>TOTAL</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, background: '#ecebe3' }}>{fmtMXN(totalCosto)}</td>
                </tr>
              </tbody>
            </table>

            <p style={{ marginTop: 16 }}>El(la) responsable acepta las siguientes condiciones:</p>
            <ol style={{ paddingLeft: 22, marginTop: 8 }}>
              <li>Resguardar los bienes en las instalaciones autorizadas o, en su caso, donde se le haya asignado realizar funciones laborales.</li>
              <li>Reportar inmediatamente cualquier robo, extravío o daño a través del Departamento de Activos Fijos.</li>
              <li>Cubrir los costos de reparación o reposición derivados de uso negligente, comprobado mediante acta administrativa.</li>
              <li>Devolver los bienes al término de la relación laboral o cuando le sea requerido por la autoridad competente.</li>
            </ol>

            <div className="signature-block">
              <div className="sig-line">{e.nombre} {e.apellidos}<br/><span style={{ fontSize: 10, color: '#5e5b51' }}>RESGUARDANTE</span></div>
              <div className="sig-line">Lic. María Elena Torres Aguilar<br/><span style={{ fontSize: 10, color: '#5e5b51' }}>RESPONSABLE DE ACTIVOS</span></div>
            </div>

            <div style={{ marginTop: 60, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#5e5b51' }}>
              Documento generado electrónicamente por el sistema Gestor de Resguardos · v2.4 · Hash: 9F3A·B72E·40D1·5C28
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { PageAsignaciones });
