import { useState } from 'react';

import type { Booking } from '@/domain/booking/booking.types';
import { useAppState } from '@/state/app-provider';

export function useCreateBooking() {
  const { currentBooking, currentUser, saveBooking } = useAppState();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBooking(rideId: string) {
    if (!currentUser) {
      setError('Usuário não encontrado.');
      return false;
    }

    if (currentBooking) {
      setError('Você já possui uma carona escolhida.');
      return false;
    }

    if (isSaving) return false;

    setIsSaving(true);
    setError(null);

    const booking: Booking = {
      id: `${Date.now()}`,
      rideId,
      userId: currentUser.userId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveBooking(booking);
      return true;
    } catch (bookingError) {
      // Erros legiveis do backend (reserva duplicada, carona lotada) podem
      // ir direto para a UI; fora isso, mantenha a mensagem generica.
      setError(
        bookingError instanceof Error && bookingError.message
          ? bookingError.message
          : 'Não foi possível escolher esta carona.',
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return { createBooking, isSaving, error };
}