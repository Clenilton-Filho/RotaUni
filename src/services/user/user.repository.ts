import type { UserProfile } from '@/domain/user/user.types';
import { asyncStorageAdapter } from '@/storage/async-storage.adapter';
import { StorageKeys } from '@/storage/storage.keys';

export interface UserRepository {
  getCurrentUser(): Promise<UserProfile | null>;
  saveUser(user: UserProfile): Promise<void>;
  updateUser(user: UserProfile): Promise<void>;
}

export const userRepository: UserRepository = {
  getCurrentUser() {
    return asyncStorageAdapter.get<UserProfile>(StorageKeys.currentUser);
  },

  saveUser(user) {
    return asyncStorageAdapter.set(StorageKeys.currentUser, user);
  },

  updateUser(user) {
    return asyncStorageAdapter.set(StorageKeys.currentUser, user);
  },
};