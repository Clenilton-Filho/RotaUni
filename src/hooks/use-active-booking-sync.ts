import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { useAppState } from '@/state/app-provider';

const POLLING_INTERVAL_MS = 13_000;

/** Resolucao da fonte do modulo booking (mesma precedencia da fabrica). */
const isHttpBookingSource =
  (process.env.EXPO_PUBLIC_BOOKING_DATA_SOURCE || process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock') === 'http';

/**
 * Sincronizacao da reserva ativa sem WebSockets:
 * - reconsulta a reserva quando a tela ganha foco;
 * - enquanto existir reserva 'pending' em modo HTTP, faz polling leve
 *   (motorista pode confirmar/recusar por fora). Em mock, aprovacao e
 *   instantanea e nao ha polling.
 */
export function useActiveBookingSync() {
  const { currentBooking, currentAccount, refreshCurrentBooking } = useAppState();

  // Condicao de (re)agendamento do polling; o valor fresco da reserva vem
  // do provider (state), lido dentro do callback.
  const shouldPoll = isHttpBookingSource && currentBooking?.status === 'pending';

  useFocusEffect(
    useCallback(() => {
      if (!currentAccount) return undefined;

      let isCancelled = false;
      const refresh = async () => {
        if (isCancelled) return;
        try {
          await refreshCurrentBooking();
        } catch {
          // Falha de rede no refresh nao deve derrubar a tela; o proximo
          // foco/tick do polling tenta novamente.
        }
      };

      void refresh();
      const interval = shouldPoll ? setInterval(refresh, POLLING_INTERVAL_MS) : undefined;

      return () => {
        isCancelled = true;
        if (interval) clearInterval(interval);
      };
    }, [currentAccount, refreshCurrentBooking, shouldPoll]),
  );
}
