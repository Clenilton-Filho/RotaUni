import type { Booking } from '@/domain/booking/booking.types';

import { HttpBookingRepository } from './http-booking.repository';
import { LocalBookingRepository } from './local-booking.repository';

export interface BookingRepository {
  getCurrentBooking(): Promise<Booking | null>;
  /** Persiste a reserva (cria no modo HTTP) e retorna a versao confirmada pelo backend. */
  saveBooking(booking: Booking): Promise<Booking>;
  /** Cancela a reserva ativa do usuario logado. */
  clearCurrentBooking(): Promise<void>;
}

export type BookingDataSource = 'mock' | 'http';

function resolveConfig(): { dataSource: BookingDataSource; baseUrl: string } {
  const dataSource: BookingDataSource = (process.env.EXPO_PUBLIC_BOOKING_DATA_SOURCE || process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock') === 'http' ? 'http' : 'mock';
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (dataSource === 'http' && !baseUrl) {
    throw new Error(
      'EXPO_PUBLIC_BOOKING_DATA_SOURCE=http exige EXPO_PUBLIC_API_BASE_URL definida. ' +
        'Consulte .env.example.',
    );
  }

  return { dataSource, baseUrl: baseUrl ?? '' };
}

const bookingDataSourceConfig = resolveConfig();

if (__DEV__) {
  console.log(
    bookingDataSourceConfig.dataSource === 'http'
      ? `[RotaUni] Booking Data Source: HTTP (${bookingDataSourceConfig.baseUrl})`
      : '[RotaUni] Booking Data Source: MOCK',
  );
}

/** Fabrica centralizada de reservas: chaveia entre local (AsyncStorage) e HTTP. */
export const bookingRepository: BookingRepository =
  bookingDataSourceConfig.dataSource === 'http'
    ? new HttpBookingRepository(bookingDataSourceConfig.baseUrl)
    : new LocalBookingRepository();
