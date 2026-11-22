import type { Ride } from '@/domain/rides/ride.types';

import type { RidesRepository } from './rides.repository';
import { ApiClient, ApiError } from '../api/api-client';
import { LocalSessionRepository } from '../auth/local-session.repository';

const RIDES_PATH = '/api/v1/rides';

type RawRide = Record<string, any>;

/** Normaliza o status da API para o dominio, com fallback 'open'. */
function toRide(raw: RawRide): Ride {
  const status = raw.status?.toLowerCase();
  const normalized: Ride['status'] =
    status === 'in_progress' || status === 'finished' || status === 'completed' || status === 'cancelled'
      ? status
      : 'open';

  // Fase D: escopo institucional. Fallback vazio para respostas antigas
  // (a restricao por universidade/campus vive no backend).
  return {
    id: raw.id,
    driver: raw.driver ?? {
      id: raw.driverId,
      name: raw.driverName ?? 'Motorista',
      rating: raw.driverRating ?? null,
    },
    vehicle: typeof raw.vehicle === 'string' ? raw.vehicle : raw.vehicle?.model ?? '',
    vehicleColor: raw.vehicleColor ?? raw.vehicle?.color ?? '',
    departureTime: raw.departureTime,
    destination: raw.destination,
    totalCapacity: raw.totalCapacity ?? raw.availableSeats ?? (typeof raw.vehicle === 'object' ? raw.vehicle.seats : undefined) ?? 0,
    confirmedPassengers: raw.confirmedPassengers ?? 0,
    passengerNames: raw.passengerNames ?? [],
    price: raw.price ?? 0,
    status: normalized,
    university: raw.university ?? '',
    campus: raw.campus ?? '',
  };
}

/**
 * Fase D: escopo institucional — `GET /api/v1/rides` filtra caronas pela
 * universidade/campus do usuario identificado no header `X-User-Id`.
 * Sem header, o backend cai no usuario padrao de teste (user-001), o que
 * mascarava o escopo do usuario logado; aqui a sessao ativa e sempre
 * injetada, no mesmo padrao dos demais repositorios HTTP.
 */
export class HttpRidesRepository implements RidesRepository {
  private readonly client: ApiClient;
  private readonly sessionRepository: LocalSessionRepository;

  constructor(baseUrl: string) {
    this.client = new ApiClient(baseUrl);
    console.info(`[RotaUni] HttpRidesRepository baseUrl=${this.client.baseUrlForDiagnostics || '(vazia)'}`);
    this.sessionRepository = new LocalSessionRepository();
  }

  async listAvailableRides(): Promise<Ride[]> {
    console.info(`[RotaUni] GET ${this.client.baseUrlForDiagnostics}${RIDES_PATH}`);
    const response = await this.client.get(
      RIDES_PATH,
      await this.resolveIdentityHeaders(),
    );

    if (!response.ok) {
      console.error(`[RotaUni] GET ${RIDES_PATH} respondeu HTTP ${response.status}`);
      throw new ApiError(
        'Não foi possível carregar as caronas.',
        { status: response.status },
      );
    }

    const rides = ((await response.json()) as RawRide[]).map(toRide);
    console.info(`[RotaUni] GET ${RIDES_PATH} retornou ${rides.length} caronas`);
    return rides;
  }

  async getRideById(id: string): Promise<Ride | null> {
    const response = await this.client.get(
      `${RIDES_PATH}/${encodeURIComponent(id)}`,
      await this.resolveIdentityHeaders(),
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new ApiError(
        'Não foi possível carregar a carona.',
        { status: response.status },
      );
    }

    return toRide((await response.json()) as RawRide);
  }

  /** Header X-User-Id da sessao ativa (sem header quando nao ha sessao). */
  private async resolveIdentityHeaders(): Promise<Record<string, string>> {
    const session = await this.sessionRepository.getCurrentSession();
    return session?.accountId ? { 'X-User-Id': session.accountId } : {};
  }
}
