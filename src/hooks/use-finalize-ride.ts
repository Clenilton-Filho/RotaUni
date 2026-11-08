import { useState } from 'react';

import { rideHistoryRepository } from '@/services/history/local-ride-history.repository';
import { ratingRepository } from '@/services/rating/local-rating.repository';
import { ridesRepository } from '@/services/rides/rides.repository';
import { useAppState } from '@/state/app-provider';

export function useFinalizeRide() {
  const { clearBooking, currentBooking, currentUser } = useAppState();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finalizeRide() {
    if (!currentUser || !currentBooking) {
      setError('Nenhuma carona atual para finalizar.');
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