import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import type { Booking } from '@/domain/booking/booking.types';
import type { UserProfile } from '@/domain/user/user.types';
import { bookingRepository } from '@/services/booking/local-booking.repository';
import { rideHistoryRepository } from '@/services/history/local-ride-history.repository';
import { ratingRepository } from '@/services/rating/local-rating.repository';
import { userRepository } from '@/services/user/user.repository';

type AppState = {
  currentUser: UserProfile | null;
  currentBooking: Booking | null;
  isHydrated: boolean;
  saveUser: (user: UserProfile) => Promise<void>;
  updateUser: (user: UserProfile) => Promise<void>;
  saveBooking: (booking: Booking) => Promise<void>;
  clearBooking: () => Promise<void>;
  logout: () => Promise<void>;
  resetLocalData: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    Promise.all([userRepository.getCurrentUser(), bookingRepository.getCurrentBooking()])
      .then(([user, booking]) => {
        setCurrentUser(user);
        setCurrentBooking(booking);
      })
      .finally(() => setIsHydrated(true));
  }, []);

  async function saveUser(user: UserProfile) {
    await userRepository.saveUser(user);
    setCurrentUser(user);
  }

  async function updateUser(user: UserProfile) {
    await userRepository.updateUser(user);
    setCurrentUser(user);
  }

  async function saveBooking(booking: Booking) {
    await bookingRepository.saveBooking(booking);
    setCurrentBooking(booking);
  }

  async function clearBooking() {
    await bookingRepository.clearCurrentBooking();
    setCurrentBooking(null);
  }

  async function logout() {
    await Promise.all([userRepository.removeCurrentUser(), bookingRepository.clearCurrentBooking()]);
    setCurrentUser(null);
    setCurrentBooking(null);
  }

  async function resetLocalData() {
    await Promise.all([
      userRepository.removeCurrentUser(),
      bookingRepository.clearCurrentBooking(),
      rideHistoryRepository.clearAll(),
      ratingRepository.clearAll(),
    ]);
    setCurrentUser(null);
    setCurrentBooking(null);
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentBooking,
        isHydrated,
        saveUser,
        updateUser,
        saveBooking,
        clearBooking,
        logout,
        resetLocalData,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }

  return context;
}