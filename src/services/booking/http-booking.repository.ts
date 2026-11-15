import type { Booking, BookingStatus } from '@/domain/booking/booking.types';

import type { BookingRepository } from './booking.repository';
import { BookingAlreadyExistsError } from './local-booking.repository';
import { LocalSessionRepository } from '../auth/local-session.repository';
import { ApiClient } from '../api/api-client';

const BOOKINGS_PATH = '/api/v1/bookings';

/** Resposta do backend: BookingResponseDTO (status do ciclo de aprovacao). */
type BookingApiResponse = {
  id: string;
  rideId: string;
  passengerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
};

/**
 * Repositorio HTTP de reservas do modulo booking (rotauni-api).
 *
 * O usuario logado vem da sessao local (LocalSessionRepository) e preenche
 * o header X-User-Id em todas as chamadas. Sem fallback silencioso:
 * falha de rede/5xx sempre propaga.
 */
export class HttpBookingRepository implements BookingRepository {
  private readonly client: ApiClient;
  private readonly sessionRepository: LocalSessionRepository;

  constructor(baseUrl: string) {
    this.client = new ApiClient(baseUrl);
    this.sessionRepository = new LocalSessionRepository();
  }

  /**
   * Cria a reserva no backend (POST /api/v1/bookings). O id gerado pelo
   * cliente e descartado: a versao retornada (id do servidor) e a valida
   * para operacoes seguintes, como o cancelamento.
   */
  async saveBooking(booking: Booking): Promise<Booking> {
    const userId = await this.resolveLoggedUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado.');
    }

    const response = await this.client.post(
      BOOKINGS_PATH,
      { rideId: booking.rideId },
      { 'X-User-Id': userId },
    );

    if (response.status === 400) {
      throw new Error('Carona lotada. Não há vagas disponíveis.');
    }

    if (response.status === 409) {
      throw new BookingAlreadyExistsError();
    }

    if (!response.ok) {
      throw new Error(`Não foi possível escolher esta carona (HTTP ${response.status}).`);
    }

    const created = (await response.json()) as BookingApiResponse;
    return toBooking(created);
  }

  /** 404 -> null (sem reserva ativa), conforme contrato da interface. */
  async getCurrentBooking(): Promise<Booking | null> {
    const userId = await this.resolveLoggedUserId();
    if (!userId) {
      return null;
    }

    const response = await this.client.get(`${BOOKINGS_PATH}/active`, {
      'X-User-Id': userId,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Não foi possível carregar a reserva (HTTP ${response.status}).`);
    }

    const active = (await response.json()) as BookingApiResponse;
    return toBooking(active);
  }

  /** Cancela a reserva ativa via DELETE /api/v1/bookings/{id}; sem reserva ativa e no-op. */
  async clearCurrentBooking(): Promise<void> {
    const active = await this.getCurrentBooking();
    if (!active) {
      return;
    }

    const response = await this.client.delete([BOOKINGS_PATH, active.id].join('/'), {
      'X-User-Id': active.userId,
    });

    if (!response.ok) {
      throw new Error(`Não foi possível cancelar a reserva (HTTP ${response.status}).`);
    }
  }

  /** Identidade simulada: accountId da sessao local (LocalSessionRepository). */
  private async resolveLoggedUserId(): Promise<string | null> {
    const session = await this.sessionRepository.getCurrentSession();
    return session?.accountId ?? null;
  }
}

function toBooking(response: BookingApiResponse): Booking {
  return {
    id: response.id,
    rideId: response.rideId,
    userId: response.passengerId,
    // O status vem do servidor (ciclo de aprovacao); /active so entrega
    // PENDING ou CONFIRMED (REJECTED permanece legivel ate ser dispensado).
    status: toBookingStatus(response.status),
    createdAt: response.createdAt,
  };
}

function toBookingStatus(responseStatus: BookingApiResponse['status']): BookingStatus {
  switch (responseStatus) {
    case 'PENDING':
      return 'pending';
    case 'CONFIRMED':
      return 'confirmed';
    default:
      return 'rejected';
  }
}
