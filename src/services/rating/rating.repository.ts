import type { Rating } from '@/domain/rating/rating.types';

import { HttpRatingRepository } from './http-rating.repository';
import { LocalRatingRepository } from './local-rating.repository';

export interface RatingRepository {
  getByRideAndUser(rideId: string, userId: string): Promise<Rating | null>;
  saveRating(rating: Rating): Promise<Rating>;
  clearAll(): Promise<void>;
}

export type RatingDataSource = 'mock' | 'http';

function resolveConfig(): { dataSource: RatingDataSource; baseUrl: string } {
  const dataSource: RatingDataSource = (process.env.EXPO_PUBLIC_RATING_DATA_SOURCE || process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock') === 'http' ? 'http' : 'mock';
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (dataSource === 'http' && !baseUrl) {
    throw new Error(
      'EXPO_PUBLIC_RATING_DATA_SOURCE=http exige EXPO_PUBLIC_API_BASE_URL definida. ' +
        'Consulte .env.example.',
    );
  }

  return { dataSource, baseUrl: baseUrl ?? '' };
}

const ratingDataSourceConfig = resolveConfig();

if (__DEV__) {
  console.log(
    ratingDataSourceConfig.dataSource === 'http'
      ? `[RotaUni] Rating Data Source: HTTP (${ratingDataSourceConfig.baseUrl})`
      : '[RotaUni] Rating Data Source: MOCK',
  );
}

/** Fabrica centralizada de avaliacoes: chaveia entre local (AsyncStorage) e HTTP. */
export const ratingRepository: RatingRepository =
  ratingDataSourceConfig.dataSource === 'http'
    ? new HttpRatingRepository(ratingDataSourceConfig.baseUrl)
    : new LocalRatingRepository();
