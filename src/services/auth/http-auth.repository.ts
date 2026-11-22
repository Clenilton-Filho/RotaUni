import type { CreateAccountInput, UserAccount } from '@/domain/auth/user-account.types';

import { type RegisterProfileFields, type UserAccountRepository } from './user-account.repository';
import { ApiClient } from '../api/api-client';

const LOGIN_PATH = '/api/v1/auth/login';
const REGISTER_PATH = '/api/v1/auth/register';

type AuthApiUser = {
  id: string;
  name: string;
  email: string;
  university: string;
  campus: string;
  course?: string;
  rating?: number | null;
};

type AuthApiResponse = {
  token: string;
  user: AuthApiUser;
};

/**
 * Repositorio HTTP do backend Spring Boot (rotauni-api).
 *
 * Sem fallback silencioso: falhas de rede e 5xx sao sempre propagadas.
 * O material de senha (salt/hash) e exclusivo do modo local; no modo HTTP
 * a verificacao de credenciais acontece no servidor, por isso os campos
 * permanecem vazios no objeto retornado.
 */
export class HttpUserAccountRepository implements UserAccountRepository {
  private readonly client: ApiClient;

  constructor(baseUrl: string) {
    this.client = new ApiClient(baseUrl);
  }

  async createAccount(input: CreateAccountInput & RegisterProfileFields): Promise<UserAccount> {
    // Corpo mapeado exatamente para o RegisterRequestDTO do Spring Boot:
    // { name, email, password, university, campus } — todos obrigatórios (@NotBlank).
    const name = input.name ?? '';
    const university = input.university || input.institution || '';
    const campus = input.campus ?? '';

    if (!name || !university || !campus) {
      throw new Error(
        'Registro via HTTP exige name, university (ou institution) e campus. ' +
          'Consulte o fluxo de cadastro.',
      );
    }

    const body = {
      name,
      email: input.email,
      password: input.password,
      university,
      campus,
      course: input.course ?? 'Não informado',
    };

    const response = await this.client.post(REGISTER_PATH, body);

    if (response.status === 409) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    if (!response.ok) {
      throw new Error(`Não foi possível criar a conta (HTTP ${response.status}).`);
    }

    const { user, token } = (await response.json()) as AuthApiResponse;
    return toAccount(user, token);
  }

  async findByEmail(_email: string): Promise<UserAccount | null> {
    // Sem endpoint de busca por email no backend nesta etapa.
    throw new Error('Busca por email não suportada no modo HTTP.');
  }

  async getById(id: string): Promise<UserAccount | null> {
    const response = await this.client.get('/api/v1/users/me', {
      'X-User-Id': id,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Não foi possível verificar a conta (HTTP ${response.status}).`);
    }

    const user = (await response.json()) as AuthApiUser;
    return toAccount(user);
  }

  /** 401 -> null, conforme contrato da interface (a tela de login oferece a mensagem legivel). */
  async verifyCredentials(email: string, password: string): Promise<UserAccount | null> {
    const response = await this.client.post(
      LOGIN_PATH,
      { email, password },
    );

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Não foi possível autenticar (HTTP ${response.status}).`);
    }

    const { user, token } = (await response.json()) as AuthApiResponse;
    return toAccount(user, token);
  }

  async emailExists(email: string): Promise<boolean> {
    const found = await this.findByEmail(email).catch(() => null);
    return found !== null;
  }

  async clearAll(): Promise<void> {
    // A limpeza de dados do modo HTTP e responsabilidade do backend
    // (nao existe endpoint de reset; a sessao local continua sendo limpa).
  }
}

function toAccount(user: AuthApiUser, token?: string): UserAccount {
  return {
    id: user.id,
    email: user.email,
    passwordSalt: '',
    passwordHash: '',
    passwordIterations: 0,
    createdAt: new Date().toISOString(),
    token,
  };
}
