export type RatingStars = 1 | 2 | 3 | 4 | 5;

export type Rating = {
  id: string;
  rideId: string;
  driverId: string;
  userId: string;
  stars: RatingStars;
  createdAt: string;
};

export function isRatingStars(value: number): value is RatingStars {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}