import { useEffect, useState } from 'react';

import type { Ride } from '@/domain/rides/ride.types';
import { ridesRepository } from '@/services/rides/mock-rides.repository';

export function useRide(rideId: string | undefined) {
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!rideId) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setError('Carona não informada.');
        setIsLoading(false);
      });
      return () => {
        isMounted = false;
      };
    }

    ridesRepository
      .getRideById(rideId)
      .then((loadedRide) => {
        if (!isMounted) return;
        setRide(loadedRide);
        setError(null);
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar a carona.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [rideId]);

  return { ride, isLoading, error };
}