// frontend/src/features/auth/Login.tsx

import { useActionState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/apiClient';

interface LoginFormState {
  error: string | null;
}

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // useActionState (React 19) — manejo nativo de form async + pending state
  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(
    async (_prev, formData) => {
      const email    = formData.get('email')    as string;
      const password = formData.get('password') as string;

      try {
        await login(email, password);
        navigate('/dashboard', { replace: true });
        return { error: null };
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Error inesperado';
        return { error: msg };
      }
    },
    { error: null }
  );

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form action={formAction} className="card w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Inventario</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
            />
          </div>

          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}

          <button type="submit" disabled={isPending} className="btn-primary w-full justify-center">
            {isPending ? 'Validando…' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
