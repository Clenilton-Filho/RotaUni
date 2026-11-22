import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import type { Ride } from '@/domain/rides/ride.types';
import { rideHistoryRepository } from '@/services/history/ride-history.repository';
import { ridesRepository } from '@/services/rides/rides.repository';
import { getRuntimeDataSource } from '@/state/data-source';
import { useAppState } from '@/state/app-provider';

export function useAvailableRides() {
  const { currentUser } = useAppState();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async (mounted: () => boolean, background = false) => {
    if (!currentUser) { setRides([]); setIsLoading(false); return; }
    console.info(`[RotaUni] Caronas: fonte=${getRuntimeDataSource()}`);
    try {
      const loaded = await ridesRepository.listAvailableRides();
      console.info(`[RotaUni] Caronas: ${loaded.length} recebidas`);
      if (!mounted()) return;
      let visible = loaded;
      try {
        const histories = await rideHistoryRepository.listByUser(currentUser.userId);
        const completed = new Set(histories.map((history) => history.rideId));
        visible = loaded.filter((ride) => !completed.has(ride.id));
      } catch (historyError) { console.warn('[RotaUni] Histórico indisponível; mantendo todas as caronas.', historyError); }
      setRides(visible); setError(null);
    } catch (cause) {
      console.error('[RotaUni] GET /api/v1/rides falhou.', cause);
      if (mounted()) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as caronas.');
    } finally { if (!background && mounted()) setIsLoading(false); }
  }, [currentUser]);
  useFocusEffect(useCallback(() => {
    let active = true;
    setIsLoading(true);
    void load(() => active);
    const polling = getRuntimeDataSource() === 'http'
      ? setInterval(() => { void load(() => active, true); }, 3000)
      : undefined;
    return () => { active = false; if (polling !== undefined) clearInterval(polling); };
  }, [load]));
  const refetch = useCallback(async () => { await load(() => true, true); }, [load]);
  return { rides, isLoading, error, refetch };
}
