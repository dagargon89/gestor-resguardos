import { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [error, action, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await login(
          formData.get('email') as string,
          formData.get('password') as string
        );
        navigate('/dashboard');
        return null;
      } catch (e: unknown) {
        return e instanceof Error ? e.message : 'Error al iniciar sesión';
      }
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestor de Resguardos</h1>
        <p className="text-sm text-gray-500 mb-6">Inicia sesión para continuar</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {pending ? 'Validando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
