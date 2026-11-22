/**
 * Cliente HTTP centralizado da API RotaUni.
 *
 * Utiliza o fetch nativo e não aplica nenhum fallback em runtime:
 * falha de rede é sempre propagada para o chamador.
 */

export class ApiError extends Error {
  public readonly status?: number;

  constructor(message: string, options?: { cause?: unknown; status?: number }) {
    super(message);
    this.name = 'ApiError';
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
    this.status = options?.status;
  }
}

export function getApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'https://rotauni-api.onrender.com';
  return baseUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '') + '/api/v1';
}

const REQUEST_TIMEOUT_MS = 60_000;

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL || baseUrl || getApiBaseUrl();
    this.baseUrl = configuredUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
  }

  get baseUrlForDiagnostics() { return this.baseUrl; }

  async get(path: string, headers?: Record<string, string>): Promise<Response> {
    let response: Response;

    try {
      response = await fetchWithTimeout(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: { Accept: 'application/json', ...headers },
      });
    } catch (error) {
      throw new ApiError(
        'Não foi possível conectar à API RotaUni.',
        { cause: error },
      );
    }

    return response;
  }

  async post(path: string, body: unknown, headers?: Record<string, string>): Promise<Response> {
    let response: Response;

    try {
      response = await fetchWithTimeout(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new ApiError(
        'Não foi possível conectar à API RotaUni.',
        { cause: error },
      );
    }

    return response;
  }

  async put(path: string, body: unknown, headers?: Record<string, string>): Promise<Response> {
    let response: Response;

    try {
      response = await fetchWithTimeout(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new ApiError(
        'Não foi possível conectar à API RotaUni.',
        { cause: error },
      );
    }

    return response;
  }

  async delete(path: string, headers?: Record<string, string>): Promise<Response> {
    let response: Response;

    try {
      response = await fetchWithTimeout(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', ...headers },
      });
    } catch (error) {
      throw new ApiError(
        'Não foi possível conectar à API RotaUni.',
        { cause: error },
      );
    }

    return response;
  }
}
