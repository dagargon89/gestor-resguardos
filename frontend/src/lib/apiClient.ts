const TOKEN_KEY = 'gestor_token';
const BASE_URL  = '/api/v1';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('No autenticado');
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message ?? json.messages?.error ?? `Error ${res.status}`);
  }

  return json as T;
}

export async function download(
  path: string,
  filename: string,
  query?: Record<string, string>
): Promise<void> {
  const token = getToken();
  const qs    = query ? '?' + new URLSearchParams(query).toString() : '';

  const res = await fetch(`${BASE_URL}${path}${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) throw new Error(`Error al descargar: ${res.status}`);

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
