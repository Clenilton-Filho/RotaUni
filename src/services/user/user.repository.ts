import type { UserProfile } from '@/domain/user/user.types';
import { asyncStorageAdapter } from '@/storage/async-storage.adapter';
import { StorageKeys } from '@/storage/storage.keys';

import { HttpUserRepository } from './http-user.repository';

export interface UserRepository {
  getByUserId(userId: string): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  updateProfile(profile: UserProfile): Promise<void>;
  clearAll(): Promise<void>;
}

export const localUserRepository: UserRepository = {
  async getByUserId(userId: string) {
    const profiles = (await asyncStorageAdapter.get<UserProfile[]>(StorageKeys.profiles)) ?? [];
    return profiles.find((profile) => profile.userId === userId) ?? null;
  },

  async saveProfile(profile) {
    const profiles = (await asyncStorageAdapter.get<UserProfile[]>(StorageKeys.profiles)) ?? [];
    await asyncStorageAdapter.set(StorageKeys.profiles, [...profiles, profile]);
  },

  async updateProfile(profile) {
    const profiles = (await asyncStorageAdapter.get<UserProfile[]>(StorageKeys.profiles)) ?? [];
    await asyncStorageAdapter.set(
      StorageKeys.profiles,
      profiles.map((storedProfile) =>
        storedProfile.userId === profile.userId ? profile : storedProfile,
      ),
    );
  },

  clearAll() {
    return asyncStorageAdapter.remove(StorageKeys.profiles);
  },
};

export type AuthDataSource = 'mock' | 'http';

function resolveAuthDataSource(): { dataSource: AuthDataSource; baseUrl: string } {
  const dataSource: AuthDataSource = (process.env.EXPO_PUBLIC_AUTH_DATA_SOURCE || process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock') === 'http' ? 'http' : 'mock';
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (dataSource === 'http' && !baseUrl) {
    throw new Error(
      'EXPO_PUBLIC_AUTH_DATA_SOURCE=http exige EXPO_PUBLIC_API_BASE_URL definida. ' +
        'Consulte .env.example.',
    );
  }

  return { dataSource, baseUrl: baseUrl ?? '' };
}

const profileDataSourceConfig = resolveAuthDataSource();

/** Fabrica centralizada de perfis de usuario: chaveia entre local e HTTP. */
export const userRepository: UserRepository =
  profileDataSourceConfig.dataSource === 'http'
    ? new HttpUserRepository(profileDataSourceConfig.baseUrl)
    : localUserRepository;