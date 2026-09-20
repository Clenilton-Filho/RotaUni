import { useEffect, useState } from 'react';

import type { Ride } from '@/domain/rides/ride.types';
import { rideHistoryRepository } from '@/services/history/local-ride-history.repository';
import { ridesRepository } from '@/services/rides/mock-rides.repository';
import { useAppState } from '@/state/app-provider';

export function useAvailableRides() {
  const { currentUser } = useAppState();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!currentUser) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setRides([]);
        setIsLoading(false);
      });
      return () => {
        isMounted = false;
      };
    }

    Promise.all([
      ridesRepository.listAvailableRides(),
      rideHistoryRepository.listByUser(currentUser.id),
    ])
      .then(([loadedRides, histories]) => {
        const completedRideIds = new Set(histories.map((history) => history.rideId));
        if (!isMounted) return;
        setRides(loadedRides.filter((ride) => !completedRideIds.has(ride.id)));
        setError(null);
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar as caronas.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  return { rides, isLoading, error };
}