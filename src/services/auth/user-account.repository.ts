import type { CreateAccountInput, UserAccount } from '@/domain/auth/user-account.types';
import { asyncStorageAdapter } from '@/storage/async-storage.adapter';
import { StorageKeys } from '@/storage/storage.keys';
import * as Crypto from 'expo-crypto';

import { HttpUserAccountRepository } from './http-auth.repository';
import { getRuntimeDataSource } from '@/state/data-source';

import {
    createPasswordMaterial,
    normalizeEmail,
    verifyPassword,
} from './password.service';

export type RegisterProfileFields = {
  name?: string;
  university?: string;
  institution?: string;
  campus?: string;
  course?: string;
};

export interface UserAccountRepository {
  createAccount(input: CreateAccountInput & RegisterProfileFields): Promise<UserAccount>;
  findByEmail(email: string): Promise<UserAccount | null>;
  getById(id: string): Promise<UserAccount | null>;
  verifyCredentials(email: string, password: string): Promise<UserAccount | null>;
  emailExists(email: string): Promise<boolean>;
  clearAll(): Promise<void>;
}

export class LocalUserAccountRepository implements UserAccountRepository {
  async createAccount(input: CreateAccountInput & RegisterProfileFields) {
    const email = normalizeEmail(input.email);
    const accounts = await this.getAccounts();

    if (accounts.some((account) => account.email === email)) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const account: UserAccount = {
      id: Crypto.randomUUID(),
      email,
      ...(await createPasswordMaterial(input.password)),
      createdAt: new Date().toISOString(),
    };

    await asyncStorageAdapter.set(StorageKeys.accounts, [...accounts, account]);
    return account;
  }

  async findByEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);
    const accounts = await this.getAccounts();
    return accounts.find((account) => account.email === normalizedEmail) ?? null;
  }

  async getById(id: string) {
    const accounts = await this.getAccounts();
    return accounts.find((account) => account.id === id) ?? null;
  }

  async verifyCredentials(email: string, password: string) {
    const account = await this.findByEmail(email);
    if (!account) return null;

    const isValid = await verifyPassword(
      password,
      account.passwordSalt,
      account.passwordHash,
      account.passwordIterations,
    );
    return isValid ? account : null;
  }

  async emailExists(email: string) {
    return (await this.findByEmail(email)) !== null;
  }

  async clearAll() {
    await asyncStorageAdapter.remove(StorageKeys.accounts);
  }

  private async getAccounts() {
    return (await asyncStorageAdapter.get<UserAccount[]>(StorageKeys.accounts)) ?? [];
  }
}

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

const authDataSourceConfig = resolveAuthDataSource();

if (__DEV__) {
  console.log(
    authDataSourceConfig.dataSource === 'http'
      ? `[RotaUni] Auth Data Source: HTTP (${authDataSourceConfig.baseUrl})`
      : '[RotaUni] Auth Data Source: MOCK',
  );
}

/** Fabrica centralizada de contas de usuario: chaveia entre local e HTTP. */
const httpRepository = new HttpUserAccountRepository(authDataSourceConfig.baseUrl);
const mockRepository = new LocalUserAccountRepository();
export const userAccountRepository: UserAccountRepository = new Proxy({} as UserAccountRepository, { get: (_, key: keyof UserAccountRepository) => (...args: never[]) => ((getRuntimeDataSource() === 'http' ? httpRepository : mockRepository)[key] as (...args: any[]) => any)(...args) });
