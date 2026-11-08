import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { RideHistory } from '@/domain/history/ride-history.types';
import type { Rating } from '@/domain/rating/rating.types';
import type { Ride } from '@/domain/rides/ride.types';
import { rideHistoryRepository } from '@/services/history/ride-history.repository';
import { ratingRepository } from '@/services/rating/rating.repository';
import { ridesRepository } from '@/services/rides/rides.repository';
import { useAppState } from '@/state/app-provider';

export type RideHistoryEntry = {
  history: RideHistory;
  ride: Ride | null;
  rating: Rating | null;
};

export function useRideHistory() {
  const { currentUser } = useAppState();
  const [entries, setEntries] = useState<RideHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
    let isMounted = true;

    if (!currentUser) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setEntries([]);
        setIsLoading(false);
      });
      return () => {
        isMounted = false;
      };
    }

    rideHistoryRepository
      .listByUser(currentUser.userId)
      .then((histories) =>
        Promise.all(
          histories.map(async (history) => ({
            history,
            ride: await ridesRepository.getRideById(history.rideId),
            rating: await ratingRepository.getByRideAndUser(history.rideId, currentUser.userId),
          })),
        ),
      )
      .then((loadedEntries) => {
        if (isMounted) {
          setEntries(loadedEntries);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar o histórico.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
    }, [currentUser]),
  );

  return { entries, isLoading, error };
}