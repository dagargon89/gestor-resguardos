import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'

const Login           = lazy(() => import('@/features/auth/Login'))
const Dashboard       = lazy(() => import('@/features/dashboard/Dashboard'))
const Bienes          = lazy(() => import('@/features/bienes/Bienes'))
const BienForm        = lazy(() => import('@/features/bienes/BienForm'))
const Empleados       = lazy(() => import('@/features/empleados/Empleados'))
const EmpleadoForm    = lazy(() => import('@/features/empleados/EmpleadoForm'))
const Asignaciones    = lazy(() => import('@/features/asignaciones/Asignaciones'))
const AsignacionForm  = lazy(() => import('@/features/asignaciones/AsignacionForm'))
const CartaViewer     = lazy(() => import('@/features/cartas/CartaViewer'))
const Organizaciones  = lazy(() => import('@/features/organizaciones/Organizaciones'))
const Reportes        = lazy(() => import('@/features/reportes/Reportes'))
const PortalEmpleado  = lazy(() => import('@/features/portal/PortalEmpleado'))

const Spinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"                   element={<Dashboard />} />
              <Route path="bienes"                      element={<Bienes />} />
              <Route path="bienes/nuevo"                element={<BienForm />} />
              <Route path="bienes/:id/editar"           element={<BienForm />} />
              <Route path="empleados"                   element={<Empleados />} />
              <Route path="empleados/nuevo"             element={<EmpleadoForm />} />
              <Route path="empleados/:id/editar"        element={<EmpleadoForm />} />
              <Route path="asignaciones"                element={<Asignaciones />} />
              <Route path="asignaciones/nueva"          element={<AsignacionForm />} />
              <Route path="asignaciones/:id/carta"      element={<CartaViewer />} />
              <Route path="organizaciones"              element={<Organizaciones />} />
              <Route path="reportes"                    element={<Reportes />} />
              <Route path="portal"                      element={<PortalEmpleado />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
