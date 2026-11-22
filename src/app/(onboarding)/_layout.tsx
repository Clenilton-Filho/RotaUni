import { Stack } from 'expo-router';

import { useAppState } from '@/state/app-provider';

export default function OnboardingLayout() {
  const { isHydrated } = useAppState();

  if (!isHydrated) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
