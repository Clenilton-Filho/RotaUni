import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';

import { asyncStorageAdapter } from '@/storage/async-storage.adapter';
import { StorageKeys } from '@/storage/storage.keys';

import type { CreateAccountInput, UserAccount } from '@/domain/auth/user-account.types';
import type { Booking } from '@/domain/booking/booking.types';
import type { UserProfile } from '@/domain/user/user.types';
import { sessionRepository } from '@/services/auth/local-session.repository';
import { userAccountRepository } from '@/services/auth/user-account.repository';
import { bookingRepository } from '@/services/booking/booking.repository';
import { rideHistoryRepository } from '@/services/history/ride-history.repository';
import { ratingRepository } from '@/services/rating/rating.repository';
import { userRepository } from '@/services/user/user.repository';
import { getInitialDataSource, readDataSource, saveDataSource, setRuntimeDataSource, type DataSource } from './data-source';

type AppState = {
  currentAccount: UserAccount | null;
  currentUser: UserProfile | null;
  currentBooking: Booking | null;
  /** Reserva encerrada pelo motorista (finish), aguardando dispensa. */
  lastEndedBooking: Booking | null;
  isHydrated: boolean;
  /** Boas-vindas ja exibidas alguma vez (exibicao unica por dispositivo). */
  welcomeSeen: boolean;
  markWelcomeSeen: () => Promise<void>;
  register: (account: CreateAccountInput, profile: Omit<UserProfile, 'userId'>) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  updateUser: (user: UserProfile) => Promise<void>;
  saveBooking: (booking: Booking) => Promise<void>;
  refreshCurrentBooking: () => Promise<void>;
  clearBooking: () => Promise<void>;
  dismissEndedBooking: () => void;
  logout: () => Promise<void>;
  resetLocalData: () => Promise<void>;
  dataSource: DataSource;
  setDataSource: (source: DataSource) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [lastEndedBooking, setLastEndedBooking] = useState<Booking | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [welcomeSeen, setWelcomeSeen] = useState(false);
  const [dataSource, setDataSourceState] = useState<DataSource>(getInitialDataSource);
  const dataSourceRef = useRef<DataSource>(getInitialDataSource());
  // Espelho da reserva ativa para detectar a transicao nao-null -> null
  // (encerramento pelo motorista) dentro de refreshCurrentBooking.
  const currentBookingRef = useRef<Booking | null>(null);

  useEffect(() => {
    currentBookingRef.current = currentBooking;
  }, [currentBooking]);

  useEffect(() => {
    async function hydrate() {
      const source = await readDataSource();
      if (dataSourceRef.current === getInitialDataSource()) {
        setRuntimeDataSource(source); setDataSourceState(source); dataSourceRef.current = source;
      }
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

    asyncStorageAdapter
      .get<boolean>(StorageKeys.welcomeSeen)
      .then((seen) => setWelcomeSeen(seen === true))
      .catch(() => setWelcomeSeen(false))
      .finally(() => hydrate().finally(() => setIsHydrated(true)));
  }, []);

  /** Marca as boas-vindas como vistas (exibicao unica por dispositivo). */
  async function markWelcomeSeen() {
    await asyncStorageAdapter.set(StorageKeys.welcomeSeen, true);
    setWelcomeSeen(true);
  }

  async function register(accountInput: CreateAccountInput, profileData: Omit<UserProfile, 'userId'>) {
    // No modo HTTP, os campos de perfil viajam no POST /api/v1/auth/register.
    const account = await userAccountRepository.createAccount({
      ...accountInput,
      name: profileData.name,
      university: profileData.university,
      campus: profileData.campus,
      course: profileData.course ?? 'Não informado',
    });
    const profile = { ...profileData, userId: account.id };
    await userRepository.saveProfile(profile);

    // O cadastro concluído já autentica o usuário, assim como o fluxo de
    // login. No HTTP, o token vem do POST /auth/register; no mock, a conta
    // local continua válida sem token.
    await sessionRepository.saveSession({ accountId: account.id, token: account.token });
    setCurrentAccount(account);
    setCurrentUser(profile);
    const booking = await bookingRepository.getCurrentBooking();
    setCurrentBooking(booking?.userId === account.id ? booking : null);
    setLastEndedBooking(null);
  }

  async function login(email: string, password: string) {
    const account = await userAccountRepository.verifyCredentials(email, password);
    if (!account) return false;
    const profile = await userRepository.getByUserId(account.id);
    if (!profile) return false;

    await sessionRepository.saveSession({ accountId: account.id, token: account.token });
    setCurrentAccount(account);
    setCurrentUser(profile);
    const booking = await bookingRepository.getCurrentBooking();
    setCurrentBooking(booking?.userId === account.id ? booking : null);
    setLastEndedBooking(null);
    return true;
  }

  async function updateUser(user: UserProfile) {
    // A versao retornada pelo backend e a fonte da verdade (PUT /users/me).
    const updated = await userRepository.updateProfile(user);
    setCurrentUser(updated);
  }

  async function saveBooking(booking: Booking) {
    // A fachada devolve a versao confirmada pelo backend (id do servidor).
    const savedBooking = await bookingRepository.saveBooking(booking);
    setCurrentBooking(savedBooking);
    setLastEndedBooking(null);
  }

  /** Reconsulta a reserva ativa (usada por useFocusEffect/polling). */
  async function refreshCurrentBooking() {
    if (!currentAccount) return;
    const booking = await bookingRepository.getCurrentBooking();
    const activeBooking = booking?.userId === currentAccount.id ? booking : null;

    // Fase C: se a reserva ativa (pending/confirmed) sumiu do backend, o
    // motorista encerrou a viagem (finish) e ela virou historico COMPLETED.
    const previous = currentBookingRef.current;
    if (previous && !activeBooking && (previous.status === 'pending' || previous.status === 'confirmed')) {
      setLastEndedBooking(previous);
    }

    setCurrentBooking(activeBooking);
  }

  function dismissEndedBooking() {
    setLastEndedBooking(null);
  }

  async function clearBooking() {
    await bookingRepository.clearCurrentBooking();
    setCurrentBooking(null);
    setLastEndedBooking(null);
  }

  async function logout() {
    await Promise.all([sessionRepository.clearSession(), bookingRepository.clearCurrentBooking()]);
    setCurrentAccount(null);
    setCurrentUser(null);
    setCurrentBooking(null);
    setLastEndedBooking(null);
  }

  async function setDataSource(source: DataSource) {
    setRuntimeDataSource(source);
    dataSourceRef.current = source;
    setDataSourceState(source);
    await saveDataSource(source);
    if (!currentAccount) {
      await sessionRepository.clearSession();
      setCurrentUser(null);
      setCurrentBooking(null);
      setLastEndedBooking(null);
    }
  }

  async function resetLocalData() {
    await Promise.all([
      sessionRepository.clearSession(),
      userAccountRepository.clearAll(),
      userRepository.clearAll(),
      bookingRepository.clearCurrentBooking(),
      rideHistoryRepository.clearAll(),
      ratingRepository.clearAll(),
      asyncStorageAdapter.remove(StorageKeys.welcomeSeen),
    ]);
    setWelcomeSeen(false);
    setCurrentAccount(null);
    setCurrentUser(null);
    setCurrentBooking(null);
    setLastEndedBooking(null);
  }

  return (
    <AppContext.Provider
      value={{
        currentAccount,
        currentUser,
        currentBooking,
        lastEndedBooking,
        isHydrated,
        welcomeSeen,
        markWelcomeSeen,
        register,
        login,
        updateUser,
        saveBooking,
        refreshCurrentBooking,
        clearBooking,
        dismissEndedBooking,
        logout,
        resetLocalData,
        dataSource,
        setDataSource,
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
