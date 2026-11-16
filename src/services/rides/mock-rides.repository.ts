import { mockRides } from '@/data/rides';

import type { Ride } from '@/domain/rides/ride.types';
import type { RidesRepository } from './rides.repository';

/**
 * Divergencia deliberada (Fase D): o backend filtra `GET /api/v1/rides` por
 * `university` + `campus` do usuario (escopo institucional), mas o mock NAO
 * filtra. No protótipo offline o campus nasce de texto livre no cadastro;
 * um filtro por igualidade de texto deixaria a lista vazia para qualquer
 * usuario de demonstracao cujo texto nao bata exatamente com as seeds
 * ("Estácio"/"Parangaba"). A restricao real e server-authoritative.
 */
export class MockRidesRepository implements RidesRepository {
  async listAvailableRides(): Promise<Ride[]> {
    return mockRides;
  }

  async getRideById(id: string): Promise<Ride | null> {
    return mockRides.find((ride) => ride.id === id) ?? null;
  }
}
