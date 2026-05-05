// frontend/src/lib/apiClient.ts

/**
 * Cliente HTTP fino sobre fetch().
 *
 * Responsabilidades:
 *  - Inyectar el token de Shield en cada request
 *  - Parsear JSON y normalizar errores
 *  - Manejar 401 → redirige a /login
 *  - Descargar blobs (XLSX/PDF) cuando el endpoint los devuelve
 */

const TOKEN_KEY = 'inventario_token';

export class ApiError extends Error {
  constructor(
    public status: number,
    public payload: unknown,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | null | undefined>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl = '/api/v1';

  // ----- Token management -----

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // ----- Request core -----

  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url     = this.buildUrl(path, options.query);
    const headers = this.buildHeaders(options.body !== undefined);

    const res = await fetch(url, {
      method:  options.method ?? 'GET',
      headers,
      body:    options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal:  options.signal,
    });

    // 401 → forzar logout en cualquier parte de la app
    if (res.status === 401) {
      this.clearToken();
      window.location.href = '/login';
      throw new ApiError(401, null, 'Sesión expirada');
    }

    if (!res.ok) {
      const errPayload = await this.safeJson(res);
      const msg = (errPayload as { messages?: { error?: string } })?.messages?.error
               ?? `HTTP ${res.status}`;
      throw new ApiError(res.status, errPayload, msg);
    }

    return res.json() as Promise<ApiResponse<T>>;
  }

  /**
   * Descarga un archivo binario (XLSX, PDF) desde un endpoint.
   * Dispara el "save as" del navegador automáticamente.
   */
  async download(path: string, filename: string, query?: RequestOptions['query']): Promise<void> {
    const url = this.buildUrl(path, query);
    const res = await fetch(url, {
      headers: this.buildHeaders(false),
    });

    if (!res.ok) {
      throw new ApiError(res.status, null, `No se pudo descargar ${filename}`);
    }

    const blob = await res.blob();
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  // ----- Helpers privados -----

  private buildUrl(path: string, query?: RequestOptions['query']): string {
    const url = new URL(`${this.baseUrl}${path}`, window.location.origin);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== null && v !== undefined && v !== '') {
          url.searchParams.set(k, String(v));
        }
      }
    }
    return url.pathname + url.search;
  }

  private buildHeaders(hasJsonBody: boolean): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (hasJsonBody) headers['Content-Type'] = 'application/json';

    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    return headers;
  }

  private async safeJson(res: Response): Promise<unknown> {
    try { return await res.json(); }
    catch { return null; }
  }
}

export const api = new ApiClient();
