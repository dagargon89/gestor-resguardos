// Shared layout: AppShell, Sidebar, Topbar, Drawer, Modal, Toasts.

const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ---------- Theme / mode / sidebar context ----------
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ---------- Sparkline ----------
const Sparkline = ({ data, w = 80, h = 24, color = 'var(--accent)' }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="sgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill="url(#sgrad)" stroke="none"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
};

// ---------- Sidebar ----------
const NAV_GROUPS = [
  { title: 'General', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard' },
  ]},
  { title: 'Inventario', items: [
    { id: 'bienes', label: 'Bienes', icon: 'Box', count: 1207 },
    { id: 'asignaciones', label: 'Asignaciones', icon: 'Clipboard', count: 842 },
  ]},
  { title: 'Personas', items: [
    { id: 'empleados', label: 'Empleados', icon: 'Users', count: 318 },
    { id: 'organizaciones', label: 'Organizaciones', icon: 'Building' },
    { id: 'departamentos', label: 'Departamentos', icon: 'Folder' },
  ]},
  { title: 'Análisis', items: [
    { id: 'reportes', label: 'Reportes', icon: 'Chart' },
  ]},
  { title: 'Administración', items: [
    { id: 'usuarios', label: 'Usuarios y acceso', icon: 'Shield' },
    { id: 'configuracion', label: 'Configuración', icon: 'Settings' },
  ]},
  { title: 'Empleado', items: [
    { id: 'portal', label: 'Mi portal', icon: 'Globe' },
    { id: 'perfil', label: 'Mi perfil', icon: 'Key' },
  ]},
];

const Sidebar = () => {
  const { route, setRoute } = useApp();
  return (
    <aside className="sidebar" data-screen-label="sidebar">
      <div className="brand">
        <div className="brand-mark">G</div>
        <div className="col" style={{ gap: 0 }}>
          <div className="brand-text">Gestor de Resguardos</div>
          <div className="brand-sub">SECINN · v2.4</div>
        </div>
      </div>
      <nav className="nav">
        {NAV_GROUPS.map((g, gi) => (
          <div key={gi} className="col" style={{ gap: 1 }}>
            <div className="nav-group"><span className="nav-group-title">{g.title}</span></div>
            {g.items.map(it => {
              const Ic = I[it.icon];
              const active = route === it.id;
              return (
                <div key={it.id} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setRoute(it.id)}>
                  <Ic/>
                  <span>{it.label}</span>
                  {it.count != null && <span className="count tnum">{it.count.toLocaleString('es-MX')}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="avatar">ME</div>
        <div className="col flex-1" style={{ gap: 0, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>María Elena Torres</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Administrador</div>
        </div>
        <button className="btn-ghost btn btn-icon btn-sm" data-tip="Cerrar sesión"><I.Logout size={14}/></button>
      </div>
    </aside>
  );
};

// ---------- Topbar ----------
const ROUTE_TITLES = {
  dashboard: ['General', 'Dashboard'],
  bienes: ['Inventario', 'Bienes'],
  asignaciones: ['Inventario', 'Asignaciones'],
  empleados: ['Personas', 'Empleados'],
  organizaciones: ['Personas', 'Organizaciones'],
  departamentos: ['Personas', 'Departamentos'],
  reportes: ['Análisis', 'Reportes'],
  usuarios: ['Administración', 'Usuarios y acceso'],
  configuracion: ['Administración', 'Configuración'],
  portal: ['Empleado', 'Mi portal'],
  perfil: ['Empleado', 'Mi perfil'],
};

const Topbar = () => {
  const { route, mode, setMode, sidebar, setSidebar } = useApp();
  const [section, page] = ROUTE_TITLES[route] || ['', route];
  return (
    <header className="topbar">
      <button className="btn btn-icon btn-sm btn-ghost" onClick={() => setSidebar(sidebar === 'visible' ? 'hidden' : 'visible')} data-tip="Mostrar / ocultar barra lateral">
        <I.PanelLeft size={16}/>
      </button>
      <div className="crumbs">
        <span>{section}</span>
        <I.Chevron size={12} className="sep"/>
        <span className="now">{page}</span>
      </div>
      <div className="flex-1"/>
      <div className="searchbox" style={{ flex: '0 0 320px' }}>
        <I.Search size={14} className="ico-left"/>
        <input className="input input-search" placeholder="Buscar bienes, empleados, folios…"/>
        <span className="kbd" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>⌘K</span>
      </div>
      <button className="btn btn-icon btn-ghost" data-tip="Notificaciones" style={{ position: 'relative' }}>
        <I.Bell size={16}/>
        <span style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 0 2px var(--bg-0)' }}/>
      </button>
      <button className="btn btn-icon btn-ghost" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} data-tip={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
        {mode === 'dark' ? <I.Sun size={16}/> : <I.Moon size={16}/>}
      </button>
    </header>
  );
};

// ---------- Drawer / Modal scrim ----------
const Scrim = ({ onClose }) => <div className="scrim" onClick={onClose}/>;

const Drawer = ({ open, onClose, title, eyebrow, children, footer, width }) => {
  if (!open) return null;
  return (
    <>
      <Scrim onClose={onClose}/>
      <aside className="drawer" style={width ? { width } : null}>
        <div className="drawer-head">
          <div className="col flex-1" style={{ gap: 2, minWidth: 0 }}>
            {eyebrow && <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{eyebrow}</div>}
            <div style={{ fontSize: 16, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          </div>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><I.Close size={16}/></button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </>
  );
};

const Modal = ({ open, onClose, title, children, footer, width }) => {
  if (!open) return null;
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="modal" style={width ? { width } : null}>
        <div className="modal-head">
          <h2 style={{ marginBottom: 4 }}>{title}</h2>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </>
  );
};

// ---------- Misc helpers ----------
const PageHead = ({ eyebrow, title, sub, actions }) => (
  <div className="page-head">
    <div className="page-title">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {sub && <span className="sub">{sub}</span>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </div>
);

const StatusChip = ({ value }) => {
  const map = {
    'Asignado': 'accent',
    'Disponible': 'info',
    'Mantenimiento': 'warn',
    'Baja': 'danger',
    'Activa': 'accent',
    'Devuelta': 'neutral',
    'Cancelada': 'danger',
    'Pendiente': 'warn',
    'Bloqueado': 'danger',
    'Activo': 'accent',
    'Bueno': 'accent',
    'Nuevo': 'accent',
    'Regular': 'warn',
    'Malo': 'danger',
    'OK': 'accent',
    'FALLO': 'danger',
  };
  const cls = map[value] || '';
  return <span className={`chip ${cls}`}><span className="chip-dot"/>{value}</span>;
};

const Pager = ({ page, total, perPage, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const visible = [];
  for (let i = 1; i <= pages; i++) visible.push(i);
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--line-1)' }}>
      <div className="muted" style={{ fontSize: 12 }}>
        Mostrando <span className="tnum">{(page - 1) * perPage + 1}</span>–<span className="tnum">{Math.min(page * perPage, total)}</span> de <span className="tnum">{total}</span>
      </div>
      <div className="pager">
        <button className="pg-btn" onClick={() => onChange(Math.max(1, page - 1))}><I.ChevronLeft size={14}/></button>
        {visible.slice(0, 6).map(p => (
          <button key={p} className={`pg-btn ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>
        ))}
        <button className="pg-btn" onClick={() => onChange(Math.min(pages, page + 1))}><I.Chevron size={14}/></button>
      </div>
    </div>
  );
};

Object.assign(window, { AppContext, useApp, Sparkline, Sidebar, Topbar, Drawer, Modal, PageHead, StatusChip, Pager, NAV_GROUPS });
