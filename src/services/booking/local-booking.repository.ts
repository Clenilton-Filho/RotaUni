import type { Booking } from '@/domain/booking/booking.types';
import { asyncStorageAdapter } from '@/storage/async-storage.adapter';
import { StorageKeys } from '@/storage/storage.keys';

import type { BookingRepository } from './booking.repository';export class BookingAlreadyExistsError extends Error {
  constructor() {
    super('Já existe uma carona escolhida para este usuário.');
    this.name = 'BookingAlreadyExistsError';
  }
}

export class LocalBookingRepository implements BookingRepository {
  private isSaving = false;

  async getCurrentBooking(): Promise<Booking | null> {
    return asyncStorageAdapter.get<Booking>(StorageKeys.currentBooking);
  }

  async saveBooking(booking: Booking): Promise<Booking> {
    if (this.isSaving) {
      throw new BookingAlreadyExistsError();
    }

    this.isSaving = true;

    try {
      const currentBooking = await this.getCurrentBooking();

      if (currentBooking) {
        throw new BookingAlreadyExistsError();
      }

      // Paridade do prototipo: sem motorista real para aprovar, a reserva
      // mock nasce aprovada ('confirmed'), independentemente do status de
      // entrada (o modo HTTP preserva o ciclo pending -> confirm/reject).
      const approvedBooking = { ...booking, status: 'confirmed' as const };
      await asyncStorageAdapter.set(StorageKeys.currentBooking, approvedBooking);
      return approvedBooking;
    } finally {
      this.isSaving = false;
    }
  }

  async clearCurrentBooking(): Promise<void> {
    await asyncStorageAdapter.remove(StorageKeys.currentBooking);
  }
}
