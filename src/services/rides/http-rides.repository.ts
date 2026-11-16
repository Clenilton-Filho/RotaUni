import type { Ride } from '@/domain/rides/ride.types';

import type { RidesRepository } from './rides.repository';
import { ApiClient, ApiError } from '../api/api-client';
import { LocalSessionRepository } from '../auth/local-session.repository';

const RIDES_PATH = '/api/v1/rides';

type RawRide = Ride & { status?: string; university?: string; campus?: string };

/** Normaliza o status da API para o dominio, com fallback 'open'. */
function toRide(raw: RawRide): Ride {
  const status = raw.status?.toLowerCase();
  const normalized: Ride['status'] =
    status === 'in_progress' || status === 'finished' ? status : 'open';

  // Fase D: escopo institucional. Fallback vazio para respostas antigas
  // (a restricao por universidade/campus vive no backend).
  return {
    ...raw,
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
    this.sessionRepository = new LocalSessionRepository();
  }

  async listAvailableRides(): Promise<Ride[]> {
    const response = await this.client.get(
      RIDES_PATH,
      await this.resolveIdentityHeaders(),
    );

    if (!response.ok) {
      throw new ApiError(
        'Não foi possível carregar as caronas.',
        { status: response.status },
      );
    }

    return ((await response.json()) as RawRide[]).map(toRide);
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
