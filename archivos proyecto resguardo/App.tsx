// frontend/src/App.tsx

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Boxes, FileClock, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';

// Lazy load — chunks separados para cada feature
const Login       = lazy(() => import('./features/auth/Login'));
const Dashboard   = lazy(() => import('./features/dashboard/Dashboard'));
const Inventario  = lazy(() => import('./features/inventario/Inventario'));
const Bitacora    = lazy(() => import('./features/bitacora/Bitacora'));

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedLayout />}>
          <Route index               element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="inventario"   element={<Inventario />} />
          <Route path="bitacora"     element={<Bitacora />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// ============================================================================
// Layout protegido — sidebar + topbar
// ============================================================================

function ProtectedLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center px-6">
          <span className="text-lg font-bold text-brand-600">Inventario</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <NavItem to="/dashboard"  icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/inventario" icon={<Boxes size={18} />}           label="Inventario" />
          <NavItem to="/bitacora"   icon={<FileClock size={18} />}       label="Bitácora" />
        </nav>

        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden bg-slate-50 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

// ============================================================================
// Helpers UI
// ============================================================================

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-brand-600" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-slate-600">Esta ruta no existe.</p>
      <NavLink to="/dashboard" className="btn-primary">Volver al dashboard</NavLink>
    </div>
  );
}
