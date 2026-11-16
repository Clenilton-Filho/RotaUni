import { useState } from 'react';

import { rideHistoryRepository } from '@/services/history/ride-history.repository';
import { ratingRepository } from '@/services/rating/rating.repository';
import { ridesRepository } from '@/services/rides/rides.repository';
import { useAppState } from '@/state/app-provider';

/** Resolucao da fonte do modulo booking (mesma precedencia da fabrica). */
const isHttpBookingSource =
  (process.env.EXPO_PUBLIC_BOOKING_DATA_SOURCE || process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock') === 'http';

export function useFinalizeRide() {
  const { clearBooking, currentBooking, currentUser } = useAppState();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finalizeRide() {
    if (!currentUser || !currentBooking) {
      setError('Nenhuma carona atual para finalizar.');
      return false;
    }

    if (currentBooking.status !== 'confirmed') {
      setError('Aguardando confirmação do motorista.');
      return false;
    }

    if (isFinalizing) return false;

    setIsFinalizing(true);
    setError(null);

    try {
      const ride = await ridesRepository.getRideById(currentBooking.rideId);

      if (!ride) {
        setError('Carona não encontrada.');
        return false;
      }

      // Fase C (HTTP): a viagem precisa ter sido iniciada pelo motorista
      // (in_progress). Em mock nao ha motorista real — liberado.
      if (isHttpBookingSource && ride.status !== 'in_progress') {
        setError(
          ride.status === 'finished'
            ? 'A viagem já foi encerrada pelo motorista.'
            : 'A viagem ainda não foi iniciada pelo motorista.',
        );
        return false;
      }

      const rating = await ratingRepository.getByRideAndUser(ride.id, currentUser.userId);

      await rideHistoryRepository.save({
        id: `${Date.now()}`,
        rideId: ride.id,
        userId: currentUser.userId,
        driverId: ride.driver.id,
        ...(rating ? { ratingId: rating.id } : {}),
        completedAt: new Date().toISOString(),
      });
      await clearBooking();
      return true;
    } catch {
      setError('Não foi possível finalizar a carona.');
      return false;
    } finally {
      setIsFinalizing(false);
    }
  }

  return { finalizeRide, isFinalizing, error };
}