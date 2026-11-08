import type { RideHistory } from '@/domain/history/ride-history.types';

import { HttpRideHistoryRepository } from './http-ride-history.repository';
import { LocalRideHistoryRepository } from './local-ride-history.repository';

export interface RideHistoryRepository {
  listByUser(userId: string): Promise<RideHistory[]>;
  /** Finaliza a reserva ativa correspondente e registra a entrada no historico. */
  save(history: RideHistory): Promise<RideHistory>;
  clearAll(): Promise<void>;
}

export type HistoryDataSource = 'mock' | 'http';

function resolveConfig(): { dataSource: HistoryDataSource; baseUrl: string } {
  const dataSource: HistoryDataSource = process.env.EXPO_PUBLIC_HISTORY_DATA_SOURCE === 'http' ? 'http' : 'mock';
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (dataSource === 'http' && !baseUrl) {
    throw new Error(
      'EXPO_PUBLIC_HISTORY_DATA_SOURCE=http exige EXPO_PUBLIC_API_BASE_URL definida. ' +
        'Consulte .env.example.',
    );
  }

  return { dataSource, baseUrl: baseUrl ?? '' };
}

const historyDataSourceConfig = resolveConfig();

if (__DEV__) {
  console.log(
    historyDataSourceConfig.dataSource === 'http'
      ? `[RotaUni] History Data Source: HTTP (${historyDataSourceConfig.baseUrl})`
      : '[RotaUni] History Data Source: MOCK',
  );
}

/** Fabrica centralizada do historico: chaveia entre local (AsyncStorage) e HTTP. */
export const rideHistoryRepository: RideHistoryRepository =
  historyDataSourceConfig.dataSource === 'http'
    ? new HttpRideHistoryRepository(historyDataSourceConfig.baseUrl)
    : new LocalRideHistoryRepository();
