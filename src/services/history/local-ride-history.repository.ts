import type { RideHistory } from '@/domain/history/ride-history.types';
import { asyncStorageAdapter } from '@/storage/async-storage.adapter';
import { StorageKeys } from '@/storage/storage.keys';

import type { RideHistoryRepository } from './ride-history.repository';

export class LocalRideHistoryRepository implements RideHistoryRepository {
  async listByUser(userId: string): Promise<RideHistory[]> {
    const histories = await this.getHistories();
    return histories
      .filter((history) => history.userId === userId)
      .sort((first, second) => second.completedAt.localeCompare(first.completedAt));
  }

  async save(history: RideHistory): Promise<RideHistory> {
    const histories = await this.getHistories();
    const existingHistory = histories.find(
      (storedHistory) => storedHistory.rideId === history.rideId && storedHistory.userId === history.userId,
    );

    if (existingHistory) return existingHistory;

    await asyncStorageAdapter.set(StorageKeys.rideHistory, [...histories, history]);
    return history;
  }

  async clearAll(): Promise<void> {
    await asyncStorageAdapter.remove(StorageKeys.rideHistory);
  }

  private async getHistories(): Promise<RideHistory[]> {
    return (await asyncStorageAdapter.get<RideHistory[]>(StorageKeys.rideHistory)) ?? [];
  }
}
