import type { UserProfile } from '@/domain/user/user.types';
import { asyncStorageAdapter } from '@/storage/async-storage.adapter';
import { StorageKeys } from '@/storage/storage.keys';

import type { UserRepository } from './user.repository';
import { ApiClient } from '../api/api-client';

const USERS_ME_PATH = '/api/v1/users/me';

type UsersMeResponse = {
  id: string;
  name: string;
  email: string;
  university: string;
  campus: string;
};

/**
 * Repositorio HTTP do perfil no backend Spring Boot (rotauni-api).
 *
 * Leitura: GET /api/v1/users/me (identidade via header X-User-Id).
 * Escrita: PUT /api/v1/users/me (Fase E) — a resposta do servidor e a fonte
 * da verdade; erros 400/401/404/409 propagam a `message` do contrato
 * {"timestamp", "status", "message"}.
 */
export class HttpUserRepository implements UserRepository {
  private readonly client: ApiClient;

  constructor(baseUrl: string) {
    this.client = new ApiClient(baseUrl);
  }

  async getByUserId(userId: string): Promise<UserProfile | null> {
    const user = await this.fetchMe(userId);
    if (!user) return null;
    return this.toProfile(user);
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await cacheLocalProfile(profile);
  }

  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    const response = await this.client.put(USERS_ME_PATH, {
      name: profile.name,
      university: profile.university,
      campus: profile.campus,
    }, {
      'X-User-Id': profile.userId,
    });

    if (!response.ok) {
      throw new Error(await resolveApiErrorMessage(response));
    }

    const user = (await response.json()) as UsersMeResponse;
    return this.toProfile(user);
  }

  async clearAll(): Promise<void> {
    await asyncStorageAdapter.remove(StorageKeys.profiles);
  }

  private async fetchMe(userId: string): Promise<UsersMeResponse | null> {
    const response = await this.client.get(USERS_ME_PATH, {
      'X-User-Id': userId,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Não foi possível carregar o perfil (HTTP ${response.status}).`);
    }

    return (await response.json()) as UsersMeResponse;
  }

  /** O createdAt não faz parte do contrato do backend; é preenchido localmente. */
  private toProfile(user: UsersMeResponse): UserProfile {
    return {
      userId: user.id,
      name: user.name,
      university: user.university,
      campus: user.campus,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Extrai a `message` do contrato de erro da API; cai para uma mensagem
 * generica quando o corpo nao segue o formato {"message"}.
 */
async function resolveApiErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) return body.message;
  } catch {
    // corpo sem JSON conhecido: usa a mensagem generica abaixo
  }

  const genericMessages: Record<number, string> = {
    400: 'Dados do perfil inválidos.',
    401: 'Usuário não identificado.',
    404: 'Perfil não encontrado.',
    409: 'Cancele sua reserva ativa antes de alterar sua faculdade ou campus.',
  };

  return genericMessages[response.status]
    ?? `Não foi possível salvar o perfil (HTTP ${response.status}).`;
}

async function cacheLocalProfile(profile: UserProfile): Promise<void> {
  const profiles = (await asyncStorageAdapter.get<UserProfile[]>(StorageKeys.profiles)) ?? [];
  const withoutProfile = profiles.filter((stored) => stored.userId !== profile.userId);

  await asyncStorageAdapter.set(StorageKeys.profiles, [...withoutProfile, profile]);
}
