import { useCallback, useEffect, useState } from 'react';

import type { Ride } from '@/domain/rides/ride.types';
import { rideHistoryRepository } from '@/services/history/ride-history.repository';
import { ridesRepository } from '@/services/rides/rides.repository';
import { useAppState } from '@/state/app-provider';

export function useAvailableRides() {
  const { currentUser } = useAppState();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!currentUser) {
        setRides([]);
        setIsLoading(false);
        return;
      }

      try {
        const [loadedRides, histories] = await Promise.all([
          ridesRepository.listAvailableRides(),
          rideHistoryRepository.listByUser(currentUser.userId),
        ]);
        if (!isMounted) return;
        const completedRideIds = new Set(histories.map((history) => history.rideId));
        setRides(loadedRides.filter((ride) => !completedRideIds.has(ride.id)));
        setError(null);
      } catch {
        if (isMounted) setError('Não foi possível carregar as caronas.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  /**
   * Recarga silenciosa da listagem: nao exibe o spinner de tela cheia nem
   * limpa o conteudo atual; usada para sincronizar vagas e caronas abertas
   * quando o ciclo da reserva/carona muda durante o polling.
   */
  const refetch = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [loadedRides, histories] = await Promise.all([
        ridesRepository.listAvailableRides(),
        rideHistoryRepository.listByUser(currentUser.userId),
      ]);
      const completedRideIds = new Set(histories.map((history) => history.rideId));
      setRides(loadedRides.filter((ride) => !completedRideIds.has(ride.id)));
      setError(null);
    } catch {
      // Falha de rede no refetch silencioso nao deve derrubar a tela; o
      // proximo tick do polling tenta novamente.
    }
  }, [currentUser]);

  return { rides, isLoading, error, refetch };
}