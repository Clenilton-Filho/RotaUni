import { useEffect, useState } from 'react';

import type { Ride } from '@/domain/rides/ride.types';
import { ridesRepository } from '@/services/rides/mock-rides.repository';

export function useAvailableRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    ridesRepository
      .listAvailableRides()
      .then((loadedRides) => {
        if (!isMounted) return;
        setRides(loadedRides);
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
  }, []);

  return { rides, isLoading, error };
}