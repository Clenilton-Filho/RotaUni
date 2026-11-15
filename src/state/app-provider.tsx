import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import type { CreateAccountInput, UserAccount } from '@/domain/auth/user-account.types';
import type { Booking } from '@/domain/booking/booking.types';
import type { UserProfile } from '@/domain/user/user.types';
import { sessionRepository } from '@/services/auth/local-session.repository';
import { userAccountRepository } from '@/services/auth/user-account.repository';
import { bookingRepository } from '@/services/booking/booking.repository';
import { rideHistoryRepository } from '@/services/history/ride-history.repository';
import { ratingRepository } from '@/services/rating/rating.repository';
import { userRepository } from '@/services/user/user.repository';

type AppState = {
  currentAccount: UserAccount | null;
  currentUser: UserProfile | null;
  currentBooking: Booking | null;
  isHydrated: boolean;
  register: (account: CreateAccountInput, profile: Omit<UserProfile, 'userId'>) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  updateUser: (user: UserProfile) => Promise<void>;
  saveBooking: (booking: Booking) => Promise<void>;
  refreshCurrentBooking: () => Promise<void>;
  clearBooking: () => Promise<void>;
  logout: () => Promise<void>;
  resetLocalData: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function hydrate() {
      const session = await sessionRepository.getCurrentSession();
      if (!session) return;
      const account = await userAccountRepository.getById(session.accountId);
      const profile = account ? await userRepository.getByUserId(account.id) : null;
      const booking = account ? await bookingRepository.getCurrentBooking() : null;

      if (account && profile) {
        setCurrentAccount(account);
        setCurrentUser(profile);
        setCurrentBooking(booking?.userId === account.id ? booking : null);
      }
    }

    hydrate().finally(() => setIsHydrated(true));
  }, []);

  async function register(accountInput: CreateAccountInput, profileData: Omit<UserProfile, 'userId'>) {
    // No modo HTTP, os campos de perfil viajam no POST /api/v1/auth/register.
    const account = await userAccountRepository.createAccount({
      ...accountInput,
      name: profileData.name,
      university: profileData.university,
      campus: profileData.campus,
    });
    const profile = { ...profileData, userId: account.id };
    await userRepository.saveProfile(profile);
  }

  async function login(email: string, password: string) {
    const account = await userAccountRepository.verifyCredentials(email, password);
    if (!account) return false;
    const profile = await userRepository.getByUserId(account.id);
    if (!profile) return false;

    await sessionRepository.saveSession({ accountId: account.id });
    setCurrentAccount(account);
    setCurrentUser(profile);
    const booking = await bookingRepository.getCurrentBooking();
    setCurrentBooking(booking?.userId === account.id ? booking : null);
    return true;
  }

  async function updateUser(user: UserProfile) {
    await userRepository.updateProfile(user);
    setCurrentUser(user);
  }

  async function saveBooking(booking: Booking) {
    // A fachada devolve a versao confirmada pelo backend (id do servidor).
    const savedBooking = await bookingRepository.saveBooking(booking);
    setCurrentBooking(savedBooking);
  }

  /** Reconsulta a reserva ativa (usada por useFocusEffect/polling). */
  async function refreshCurrentBooking() {
    if (!currentAccount) return;
    const booking = await bookingRepository.getCurrentBooking();
    setCurrentBooking(booking?.userId === currentAccount.id ? booking : null);
  }

  async function clearBooking() {
    await bookingRepository.clearCurrentBooking();
    setCurrentBooking(null);
  }

  async function logout() {
    await Promise.all([sessionRepository.clearSession(), bookingRepository.clearCurrentBooking()]);
    setCurrentAccount(null);
    setCurrentUser(null);
    setCurrentBooking(null);
  }

  async function resetLocalData() {
    await Promise.all([
      sessionRepository.clearSession(),
      userAccountRepository.clearAll(),
      userRepository.clearAll(),
      bookingRepository.clearCurrentBooking(),
      rideHistoryRepository.clearAll(),
      ratingRepository.clearAll(),
    ]);
    setCurrentAccount(null);
    setCurrentUser(null);
    setCurrentBooking(null);
  }

  return (
    <AppContext.Provider
      value={{
        currentAccount,
        currentUser,
        currentBooking,
        isHydrated,
        register,
        login,
        updateUser,
        saveBooking,
        refreshCurrentBooking,
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