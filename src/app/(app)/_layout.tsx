import { Redirect, Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { TabBarTopAccentButton } from '@/components/tab-bar-button';
import { useAppState } from '@/state/app-provider';

export default function AppLayout() {
  const { currentAccount, currentUser, welcomeSeen, isHydrated } = useAppState();
  const theme = useTheme();

  if (!isHydrated) return null;
  if (!welcomeSeen) return <Redirect href="/boas-vindas" />;
  if (!currentAccount || !currentUser) {
    // Onboarding: primeira visita do dispositivo ve as boas-vindas; as
    // seguintes vao direto ao login.
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.backgroundElement, borderTopColor: theme.backgroundSelected },
        tabBarButton: (props) => <TabBarTopAccentButton {...props} />,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Caronas', tabBarAccessibilityLabel: 'Caronas' }} />
      <Tabs.Screen name="historico" options={{ title: 'Histórico', tabBarAccessibilityLabel: 'Histórico' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarAccessibilityLabel: 'Perfil' }} />
    </Tabs>
  );
}
