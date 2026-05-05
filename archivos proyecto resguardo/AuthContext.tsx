// frontend/src/context/AuthContext.tsx

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api, ApiError } from '@/lib/apiClient';

export interface User {
  id: number;
  username: string;
  email: string;
  groups: string[];
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasGroup: (group: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps { children: ReactNode; }

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser]           = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Al montar: si hay token guardado, validarlo contra /auth/me.
   * Si falla, limpiar y dejar al usuario en estado no-autenticado.
   */
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();

    api.request<User>('/auth/me', { signal: ac.signal })
      .then(res => setUser(res.data))
      .catch(err => {
        if (err instanceof ApiError) api.clearToken();
      })
      .finally(() => setIsLoading(false));

    return () => ac.abort();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const res = await api.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body:   { email, password },
    });
    api.setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.request('/auth/logout', { method: 'POST' });
    } catch {
      // Aunque falle el endpoint, limpiamos local
    }
    api.clearToken();
    setUser(null);
  }, []);

  const hasGroup = useCallback(
    (group: string) => user?.groups.includes(group) ?? false,
    [user]
  );

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    hasGroup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook con validación: lanza error si se usa fuera del provider.
 * Patrón recomendado por la doc oficial de React.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
