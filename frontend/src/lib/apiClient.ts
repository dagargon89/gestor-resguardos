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

  let json: Record<string, unknown> = {};
  const ct = res.headers.get('content-type');
  if (ct?.includes('application/json')) {
    try {
      json = (await res.json()) as Record<string, unknown>;
    } catch {
      /* cuerpo vacío o no JSON */
    }
  }

  if (res.status === 401) {
    const method = (options.method ?? 'GET').toUpperCase();
    const isLoginAttempt = path === '/auth/login' && method === 'POST';

    if (!isLoginAttempt) {
      clearToken();
      window.location.href = '/login';
    }

    const msg =
      (json.error as { message?: string } | undefined)?.message ??
      (json.messages as { error?: string } | undefined)?.error ??
      'No autenticado';
    throw new Error(msg);
  }

  if (!res.ok) {
    throw new Error(
      (json.error as { message?: string } | undefined)?.message ??
        (json.messages as { error?: string } | undefined)?.error ??
        `Error ${res.status}`
    );
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
