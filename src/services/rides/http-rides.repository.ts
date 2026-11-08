import type { Ride } from '@/domain/rides/ride.types';

import type { RidesRepository } from './rides.repository';
import { ApiClient, ApiError } from '../api/api-client';

const RIDES_PATH = '/api/v1/rides';

export class HttpRidesRepository implements RidesRepository {
  private readonly client: ApiClient;

  constructor(baseUrl: string) {
    this.client = new ApiClient(baseUrl);
  }

  async listAvailableRides(): Promise<Ride[]> {
    const response = await this.client.get(RIDES_PATH);

    if (!response.ok) {
      throw new ApiError(
        'Não foi possível carregar as caronas.',
        { status: response.status },
      );
    }

    return (await response.json()) as Ride[];
  }

  async getRideById(id: string): Promise<Ride | null> {
    const response = await this.client.get(`${RIDES_PATH}/${encodeURIComponent(id)}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new ApiError(
        'Não foi possível carregar a carona.',
        { status: response.status },
      );
    }

    return (await response.json()) as Ride;
  }
}
