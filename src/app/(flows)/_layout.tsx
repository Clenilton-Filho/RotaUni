import { Redirect, Stack } from 'expo-router';

import { useAppState } from '@/state/app-provider';

export default function FlowsLayout() {
  const { currentAccount, currentUser, welcomeSeen, isHydrated } = useAppState();

  if (!isHydrated) return null;
  if (!currentAccount || !currentUser) {
    return <Redirect href={welcomeSeen ? '/login' : '/boas-vindas'} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
