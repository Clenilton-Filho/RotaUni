import type { Rating } from '@/domain/rating/rating.types';

export interface RatingRepository {
  getByRideAndUser(rideId: string, userId: string): Promise<Rating | null>;
  saveRating(rating: Rating): Promise<Rating>;
}