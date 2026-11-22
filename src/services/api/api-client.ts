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
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new ApiError(
      'EXPO_PUBLIC_API_BASE_URL não configurada: defina a URL base da API RotaUni no ambiente. ' +
        'Consulte .env.example.',
    );
  }

  return baseUrl.replace(/\/+$/, '');
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  get baseUrlForDiagnostics() { return this.baseUrl; }

  async get(path: string, headers?: Record<string, string>): Promise<Response> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
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
      response = await fetch(`${this.baseUrl}${path}`, {
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
      response = await fetch(`${this.baseUrl}${path}`, {
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
      response = await fetch(`${this.baseUrl}${path}`, {
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
