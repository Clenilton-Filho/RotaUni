import type { Ride } from '@/domain/rides/ride.types';

import { HttpRidesRepository } from './http-rides.repository';
import { MockRidesRepository } from './mock-rides.repository';

export interface RidesRepository {
  listAvailableRides(): Promise<Ride[]>;
  getRideById(id: string): Promise<Ride | null>;
}

export type RidesDataSource = 'mock' | 'http';

type RidesRepositoryConfig = {
  dataSource: RidesDataSource;
  baseUrl: string;
};

function resolveConfig(): RidesRepositoryConfig {
  const rawDataSource = process.env.EXPO_PUBLIC_RIDES_DATA_SOURCE || process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock';
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  const dataSource: RidesDataSource = rawDataSource === 'http' ? 'http' : 'mock';

  if (dataSource === 'http' && !baseUrl) {
    throw new Error(
      'EXPO_PUBLIC_RIDES_DATA_SOURCE=http exige EXPO_PUBLIC_API_BASE_URL definida. ' +
        'Consulte .env.example.',
    );
  }

  return { dataSource, baseUrl: baseUrl ?? '' };
}

const config = resolveConfig();

if (__DEV__) {
  console.log(
    config.dataSource === 'http'
      ? `[RotaUni] Rides Data Source: HTTP (${config.baseUrl})`
      : '[RotaUni] Rides Data Source: MOCK',
  );
}

export const ridesRepository: RidesRepository =
  config.dataSource === 'http'
    ? new HttpRidesRepository(config.baseUrl)
    : new MockRidesRepository();
