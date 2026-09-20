import { Redirect, Stack, type Href } from 'expo-router';

import { useAppState } from '@/state/app-provider';

export default function AppLayout() {
  const { currentAccount, currentUser, isHydrated } = useAppState();

  if (!isHydrated) return null;
  if (!currentAccount || !currentUser) return <Redirect href={'/login' as Href} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}