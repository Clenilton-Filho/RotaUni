import type { UserSession } from '@/domain/auth/session.types';

export interface SessionRepository {
  getCurrentSession(): Promise<UserSession | null>;
  saveSession(session: UserSession): Promise<void>;
  clearSession(): Promise<void>;
}