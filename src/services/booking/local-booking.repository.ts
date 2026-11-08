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

      await asyncStorageAdapter.set(StorageKeys.currentBooking, booking);
      return booking;
    } finally {
      this.isSaving = false;
    }
  }

  async clearCurrentBooking(): Promise<void> {
    await asyncStorageAdapter.remove(StorageKeys.currentBooking);
  }
}
