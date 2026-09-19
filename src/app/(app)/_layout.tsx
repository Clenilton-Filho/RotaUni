import { Redirect, Stack, type Href } from 'expo-router';

import { useAppState } from '@/state/app-provider';

export default function AppLayout() {
  const { currentUser, isHydrated } = useAppState();

  if (!isHydrated) return null;
  if (!currentUser) return <Redirect href={'/cadastro' as Href} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}