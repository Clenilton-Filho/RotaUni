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
 * Escrita: o backend ainda nao expoe endpoint de atualizacao de perfil, entao
 * as gravacoes continuam no cache local do dispositivo ate que um
 * PUT /api/v1/users/me exista (limitacao explicita, nao e fallback de erro).
 */
export class HttpUserRepository implements UserRepository {
  private readonly client: ApiClient;

  constructor(baseUrl: string) {
    this.client = new ApiClient(baseUrl);
  }

  async getByUserId(userId: string): Promise<UserProfile | null> {
    const response = await this.client.get(USERS_ME_PATH, {
      'X-User-Id': userId,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Não foi possível carregar o perfil (HTTP ${response.status}).`);
    }

    const user = (await response.json()) as UsersMeResponse;
    return {
      userId: user.id,
      name: user.name,
      university: user.university,
      campus: user.campus,
      createdAt: new Date().toISOString(),
    };
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await cacheLocalProfile(profile);
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    await cacheLocalProfile(profile);
  }

  async clearAll(): Promise<void> {
    await asyncStorageAdapter.remove(StorageKeys.profiles);
  }
}

async function cacheLocalProfile(profile: UserProfile): Promise<void> {
  const profiles = (await asyncStorageAdapter.get<UserProfile[]>(StorageKeys.profiles)) ?? [];
  const withoutProfile = profiles.filter((stored) => stored.userId !== profile.userId);

  await asyncStorageAdapter.set(StorageKeys.profiles, [...withoutProfile, profile]);
}
