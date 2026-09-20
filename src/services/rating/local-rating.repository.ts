import type { Rating } from '@/domain/rating/rating.types';
import { asyncStorageAdapter } from '@/storage/async-storage.adapter';
import { StorageKeys } from '@/storage/storage.keys';

import type { RatingRepository } from './rating.repository';

export class LocalRatingRepository implements RatingRepository {
  private saveOperation: Promise<Rating> | null = null;

  async getByRideAndUser(rideId: string, userId: string): Promise<Rating | null> {
    const ratings = await this.getRatings();
    return ratings.find((rating) => rating.rideId === rideId && rating.userId === userId) ?? null;
  }

  async saveRating(rating: Rating): Promise<Rating> {
    if (this.saveOperation) return this.saveOperation;

    this.saveOperation = this.persistRating(rating);

    try {
      return await this.saveOperation;
    } finally {
      this.saveOperation = null;
    }
  }

  private async persistRating(rating: Rating): Promise<Rating> {
    const ratings = await this.getRatings();
    const existingRating = ratings.find(
      (storedRating) => storedRating.rideId === rating.rideId && storedRating.userId === rating.userId,
    );

    if (existingRating) return existingRating;

    await asyncStorageAdapter.set(StorageKeys.ratings, [...ratings, rating]);
    return rating;
  }

  private async getRatings(): Promise<Rating[]> {
    return (await asyncStorageAdapter.get<Rating[]>(StorageKeys.ratings)) ?? [];
  }
}

export const ratingRepository: RatingRepository = new LocalRatingRepository();