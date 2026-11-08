import { mockRides } from '@/data/rides';

import type { Ride } from '@/domain/rides/ride.types';
import type { RidesRepository } from './rides.repository';

export class MockRidesRepository implements RidesRepository {
  async listAvailableRides(): Promise<Ride[]> {
    return mockRides;
  }

  async getRideById(id: string): Promise<Ride | null> {
    return mockRides.find((ride) => ride.id === id) ?? null;
  }
}
