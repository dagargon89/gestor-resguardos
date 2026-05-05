import { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, action, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await login(
          formData.get('email') as string,
          formData.get('password') as string,
        );
        navigate('/dashboard');
        return null;
      } catch (e: unknown) {
        return e instanceof Error ? e.message : 'Error al iniciar sesión';
      }
    },
    null,
  );

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--bg-0)' }}
    >
      <div className="card card-pad w-full max-w-sm shadow-[var(--shadow-2)]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="brand-mark text-lg">G</div>
          <div className="col gap-0.5">
            <div className="brand-text text-base">Gestor de Resguardos</div>
            <div className="brand-sub">Acceso al sistema</div>
          </div>
        </div>
        <p className="dim mb-6 text-center text-sm">Inicia sesión para continuar</p>

        {error && (
          <div
            className="mb-4 rounded-[var(--r-md)] px-4 py-3 text-sm"
            style={{
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              border: '1px solid rgba(239,111,111,0.28)',
            }}
          >
            {error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <label className="field">
            <span>Correo o usuario</span>
            <input
              name="email"
              type="text"
              required
              autoComplete="username"
              className="input"
              placeholder="usuario@dominio"
            />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
            />
          </label>

          <button type="submit" disabled={pending} className="btn btn-primary w-full justify-center mt-2">
            {pending ? 'Validando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
