import type { RideHistory } from '@/domain/history/ride-history.types';

import type { RideHistoryRepository } from './ride-history.repository';
import { LocalSessionRepository } from '../auth/local-session.repository';
import { ApiClient } from '../api/api-client';

const HISTORY_PATH = '/api/v1/rides/history';
const BOOKING_ACTIVE_PATH = '/api/v1/bookings/active';

/** Resposta do backend: RideHistoryResponseDTO do Spring Boot. */
type RideHistoryApiResponse = {
  id: string;
  bookingId: string;
  rideId: string;
  passengerId: string;
  driverName: string;
  destination: string;
  departureTime: string;
  completedAt: string;
  rating: number | null;
};

/**
 * Repositorio HTTP de historico do backend rotauni-api.
 *
 * A finalizacao e uma unica operacao server-side: save() resolve a reserva
 * ativa, faz POST /api/v1/bookings/{id}/finalize e adota a resposta como
 * entrada de historico. O usuario logado vem da sessao local e preenche o
 * header X-User-Id. Sem fallback silencioso: rede/5xx sempre propagam.
 */
export class HttpRideHistoryRepository implements RideHistoryRepository {
  private readonly client: ApiClient;
  private readonly sessionRepository: LocalSessionRepository;

  constructor(baseUrl: string) {
    this.client = new ApiClient(baseUrl);
    this.sessionRepository = new LocalSessionRepository();
  }

  async listByUser(_userId: string): Promise<RideHistory[]> {
    const userId = await this.resolveLoggedUserId();
    if (!userId) {
      return [];
    }

    const response = await this.client.get(HISTORY_PATH, {
      'X-User-Id': userId,
    });

    if (!response.ok) {
      throw new Error(`Não foi possível carregar o histórico (HTTP ${response.status}).`);
    }

    const list = (await response.json()) as RideHistoryApiResponse[];
    return list.map(toHistory);
  }

  async save(_history: RideHistory): Promise<RideHistory> {
    const userId = await this.resolveLoggedUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado.');
    }

    const activeBooking = await this.getActiveBookingId(userId);
    if (!activeBooking) {
      throw new Error('Nenhuma carona atual para finalizar.');
    }

    const response = await this.client.post(
      `/api/v1/bookings/${activeBooking}/finalize`,
      null,
      { 'X-User-Id': userId },
    );

    if (response.status === 400) {
      throw new Error('Reserva já finalizada.');
    }

    if (response.status === 404) {
      throw new Error('Reserva não encontrada.');
    }

    if (!response.ok) {
      throw new Error(`Não foi possível finalizar a carona (HTTP ${response.status}).`);
    }

    const finalized = (await response.json()) as RideHistoryApiResponse;
    return toHistory(finalized);
  }

  async clearAll(): Promise<void> {
    // O backend nao expoe reset de historico; limpar dados de desenvolvimento
    // no modo HTTP e responsabilidade do servidor. Historico local (cache)
    // continua sendo limpo pelo modo 'mock'.
  }

  private async getActiveBookingId(userId: string): Promise<string | null> {
    const response = await this.client.get(BOOKING_ACTIVE_PATH, {
      'X-User-Id': userId,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Não foi possível verificar a reserva (HTTP ${response.status}).`);
    }

    const active = (await response.json()) as { id: string };
    return active.id;
  }

  private async resolveLoggedUserId(): Promise<string | null> {
    const session = await this.sessionRepository.getCurrentSession();
    return session?.accountId ?? null;
  }
}

function toHistory(response: RideHistoryApiResponse): RideHistory {
  return {
    id: response.id,
    rideId: response.rideId,
    userId: response.passengerId,
    // O backend retorna driverName, mas nao driverId; as telas resolvem o
    // motorista pela carona (ridesRepository.getRideById), nao pelo campo.
    driverId: '',
    completedAt: response.completedAt,
  };
}
