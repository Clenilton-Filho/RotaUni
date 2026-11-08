import type { Rating, RatingStars } from '@/domain/rating/rating.types';

import type { RatingRepository } from './rating.repository';
import { LocalSessionRepository } from '../auth/local-session.repository';
import { ApiClient } from '../api/api-client';

const RATINGS_PATH = '/api/v1/ratings';

/** Item de historico do backend (fonte de historyId e da avaliacao existente). */
type RideHistoryApiResponse = {
  id: string;
  rideId: string;
  passengerId: string;
  completedAt: string;
  rating: number | null;
};

/** Resposta do backend: RatingResponseDTO do Spring Boot. */
type RatingApiResponse = {
  id: string;
  historyId: string;
  passengerId: string;
  score: number;
  comment: string | null;
  createdAt: string;
};

/**
 * Repositorio HTTP de avaliacoes do rotauni-api.
 *
 * O backend usa historyId (entrada de historico finalizada) para associar a
 * nota; o front trata tudo por rideId, entao o repositorio resolve o
 * historyId consultando o historico do usuario logado. Usuario vem da
 * sessao local (LocalSessionRepository) no header X-User-Id. Sem fallback:
 * rede/5xx sempre propagam.
 */
export class HttpRatingRepository implements RatingRepository {
  private readonly client: ApiClient;
  private readonly sessionRepository: LocalSessionRepository;

  constructor(baseUrl: string) {
    this.client = new ApiClient(baseUrl);
    this.sessionRepository = new LocalSessionRepository();
  }

  /** Avaliacao existente: derivada do item de historico correspondente. */
  async getByRideAndUser(rideId: string, userId: string): Promise<Rating | null> {
    const historyItem = await this.findHistoryByRide(rideId, userId);

    if (!historyItem || historyItem.rating === null) {
      return null;
    }

    return {
      id: historyItem.id,
      rideId,
      driverId: '',
      userId,
      // O backend valida 1..5 (@Min/@Max) antes de persistir o rating.
      stars: historyItem.rating as RatingStars,
      createdAt: historyItem.completedAt,
    };
  }

  async saveRating(input: Rating): Promise<Rating> {
    const userId = await this.resolveLoggedUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado.');
    }

    const historyItem = await this.findHistoryByRide(input.rideId, userId);

    if (!historyItem) {
      throw new Error('Não há uma reserva válida para avaliar.');
    }

    if (historyItem.rating !== null) {
      throw new Error('Carona já avaliada.');
    }

    // Comment e opcional no backend; o tipo Rating do front hoje nao o expoe,
    // entao lemos de forma defensiva caso possua o campo no futuro.
    const maybeComment = (input as { comment?: string }).comment;

    const response = await this.client.post(
      RATINGS_PATH,
      {
        historyId: historyItem.id,
        score: input.stars,
        ...(maybeComment ? { comment: maybeComment } : {}),
      },
      { 'X-User-Id': userId },
    );

    if (response.status === 400) {
      throw new Error('Carona já avaliada.');
    }

    if (response.status === 404) {
      throw new Error('Histórico não encontrado.');
    }

    if (!response.ok) {
      throw new Error(`Não foi possível enviar a avaliação (HTTP ${response.status}).`);
    }

    const created = (await response.json()) as RatingApiResponse;
    return {
      id: created.id,
      rideId: input.rideId,
      driverId: input.driverId,
      userId,
      // Score do backend e validado em 1..5 no servidor (@Min/@Max).
      stars: created.score as RatingStars,
      createdAt: created.createdAt,
    };
  }

  async clearAll(): Promise<void> {
    // Reset de avaliacoes no modo HTTP e responsabilidade do backend;
    // ratings ficam ligados a finalizacao de carona e nao sao limpos por logout
    // (regra de negocio preservada no repositorio local).
  }

  private async findHistoryByRide(rideId: string, userId: string): Promise<RideHistoryApiResponse | null> {
    const response = await this.client.get('/api/v1/rides/history', {
      'X-User-Id': userId,
    });

    if (!response.ok) {
      throw new Error(`Não foi possível verificar o histórico (HTTP ${response.status}).`);
    }

    const items = (await response.json()) as RideHistoryApiResponse[];
    return items.find((item) => item.rideId === rideId) ?? null;
  }

  private async resolveLoggedUserId(): Promise<string | null> {
    const session = await this.sessionRepository.getCurrentSession();
    return session?.accountId ?? null;
  }
}
