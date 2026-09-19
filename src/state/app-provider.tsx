import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import type { UserProfile } from '@/domain/user/user.types';
import { userRepository } from '@/services/user/user.repository';

type AppState = {
  currentUser: UserProfile | null;
  isHydrated: boolean;
  saveUser: (user: UserProfile) => Promise<void>;
  updateUser: (user: UserProfile) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    userRepository
      .getCurrentUser()
      .then(setCurrentUser)
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

  return (
    <AppContext.Provider value={{ currentUser, isHydrated, saveUser, updateUser }}>
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