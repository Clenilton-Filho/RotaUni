import type { RideHistory } from '@/domain/history/ride-history.types';

export interface RideHistoryRepository {
  listByUser(userId: string): Promise<RideHistory[]>;
  save(history: RideHistory): Promise<RideHistory>;
  clearAll(): Promise<void>;
}