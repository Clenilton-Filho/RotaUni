import { useState } from 'react';

import type { Booking } from '@/domain/booking/booking.types';
import { BookingAlreadyExistsError } from '@/services/booking/local-booking.repository';
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
      userId: currentUser.id,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveBooking(booking);
      return true;
    } catch (bookingError) {
      setError(
        bookingError instanceof BookingAlreadyExistsError
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