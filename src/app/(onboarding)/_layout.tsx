import { Redirect, Stack } from 'expo-router';

import { useAppState } from '@/state/app-provider';

export default function OnboardingLayout() {
  const { currentUser, isHydrated } = useAppState();

  if (!isHydrated) return null;
  if (currentUser) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}