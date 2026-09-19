import type { Booking } from '@/domain/booking/booking.types';

export interface BookingRepository {
  getCurrentBooking(): Promise<Booking | null>;
  saveBooking(booking: Booking): Promise<void>;
  clearCurrentBooking(): Promise<void>;
}