import type { Ride } from '@/domain/rides/ride.types';

export interface RidesRepository {
  listAvailableRides(): Promise<Ride[]>;
  getRideById(id: string): Promise<Ride | null>;
}