import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Building2,
  ClipboardList,
  LogOut,
  Menu,
  PanelLeft,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Globe,
  X,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { applyTheme, readStoredTheme, type AppTheme } from '@/lib/themeInit';

const navGroups: { title: string; items: { to: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    title: 'General',
    items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    title: 'Inventario',
    items: [
      { to: '/bienes', icon: Package, label: 'Bienes' },
      { to: '/asignaciones', icon: ClipboardList, label: 'Asignaciones' },
    ],
  },
  {
    title: 'Personas',
    items: [
      { to: '/empleados', icon: Users, label: 'Empleados' },
      { to: '/organizaciones', icon: Building2, label: 'Organizaciones' },
    ],
  },
  {
    title: 'Análisis',
    items: [{ to: '/reportes', icon: FileText, label: 'Reportes' }],
  },
  {
    title: 'Empleado',
    items: [{ to: '/portal', icon: Globe, label: 'Mi portal' }],
  },
];

function matchCrumb(pathname: string): [string, string] {
  const exact: Record<string, [string, string]> = {
    '/dashboard': ['General', 'Dashboard'],
    '/bienes': ['Inventario', 'Bienes'],
    '/asignaciones': ['Inventario', 'Asignaciones'],
    '/empleados': ['Personas', 'Empleados'],
    '/organizaciones': ['Personas', 'Organizaciones'],
    '/reportes': ['Análisis', 'Reportes'],
    '/portal': ['Empleado', 'Mi portal'],
  };
  if (exact[pathname]) return exact[pathname];
  if (pathname.startsWith('/bienes/')) return ['Inventario', 'Bienes'];
  if (pathname.startsWith('/asignaciones')) return ['Inventario', 'Asignaciones'];
  if (pathname.startsWith('/empleados')) return ['Personas', 'Empleados'];
  return ['', pathname.replace(/^\//, '')];
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(() => readStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const [crumbSection, crumbPage] = useMemo(() => matchCrumb(pathname), [pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  const initials =
    user?.username?.slice(0, 2)?.toUpperCase() ||
    user?.email?.slice(0, 2)?.toUpperCase() ||
    '?';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-0)' }}
    >
      {/* Sidebar */}
      <aside
        className={[
          'sidebar flex w-[244px] shrink-0 flex-col max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-[52] max-md:shadow-[var(--shadow-pop)] max-md:transition-transform max-md:duration-200',
          mobileNavOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          sidebarCollapsed ? 'max-md:flex md:hidden' : '',
        ].join(' ')}
      >
        <div className="brand">
          <div className="brand-mark">{initials.slice(0, 1)}</div>
          <div className="col" style={{ gap: 0, minWidth: 0 }}>
            <div className="brand-text">Gestor de Resguardos</div>
            <div className="brand-sub">Inventario y resguardos</div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon md:hidden ml-auto shrink-0"
            aria-label="Cerrar menú"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <nav className="nav">
          {navGroups.map((g) => (
            <div key={g.title} className="col" style={{ gap: 1 }}>
              <div className="nav-group">
                <span className="nav-group-title">{g.title}</span>
              </div>
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <it.icon className="ico" size={16} strokeWidth={1.75} />
                  <span>{it.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="avatar">{initials}</div>
          <div className="col flex-1" style={{ gap: 0, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.username ?? user?.email ?? 'Usuario'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              {user?.groups?.[0] ?? 'Sesión activa'}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            title="Cerrar sesión"
            data-tip="Cerrar sesión"
            onClick={handleLogout}
          >
            <LogOut size={14} strokeWidth={1.75} />
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div
          className="scrim z-[51] md:hidden"
          role="presentation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="main flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="topbar">
          <button
            type="button"
            className="btn btn-icon btn-sm btn-ghost md:hidden"
            aria-label="Abrir menú"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="btn btn-icon btn-sm btn-ghost hidden md:inline-flex"
            title="Mostrar u ocultar barra lateral"
            data-tip="Mostrar / ocultar barra lateral"
            onClick={() => setSidebarCollapsed((c) => !c)}
          >
            <PanelLeft size={16} strokeWidth={1.75} />
          </button>
          <div className="crumbs">
            <span>{crumbSection}</span>
            <ChevronRight size={12} className="sep shrink-0" strokeWidth={1.75} />
            <span className="now">{crumbPage}</span>
          </div>
          <div className="flex-1" />
          <div className="searchbox hidden sm:block" style={{ flex: '0 0 min(280px, 36vw)' }}>
            <Search size={14} className="ico-left" strokeWidth={1.75} />
            <input
              className="input input-search"
              placeholder="Buscar bienes, empleados, folios…"
              readOnly
              aria-hidden
              tabIndex={-1}
            />
            <span
              className="kbd hidden lg:inline"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              ⌘K
            </span>
          </div>
          <button
            type="button"
            className="btn btn-icon btn-ghost relative"
            title="Notificaciones"
            data-tip="Notificaciones"
          >
            <Bell size={16} strokeWidth={1.75} />
            <span
              style={{
                position: 'absolute',
                top: 8,
                right: 9,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 0 2px var(--bg-0)',
              }}
            />
          </button>
          <button
            type="button"
            className="btn btn-icon btn-ghost"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            data-tip={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun size={16} strokeWidth={1.75} />
            ) : (
              <Moon size={16} strokeWidth={1.75} />
            )}
          </button>
        </header>

        <main className="content">
          <div className="content-narrow w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
