import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { request, setToken, clearToken } from '@/lib/apiClient';

interface User {
  id: number;
  username: string;
  email: string;
  groups: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasGroup: (group: string) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gestor_token');
    if (!token) { setLoading(false); return; }

    request<{ data: User }>('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await request<{ data: { token: string; user: User } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.data.token);
    setUser(res.data.user);
  }

  async function logout() {
    try { await request('/auth/logout', { method: 'POST' }); } catch { /* ok */ }
    clearToken();
    setUser(null);
  }

  function hasGroup(group: string) {
    return user?.groups?.includes(group) ?? false;
  }

  function isAdmin() {
    return hasGroup('superadmin') || hasGroup('admin');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasGroup, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
