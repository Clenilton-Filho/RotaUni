import { Redirect, Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { TabBarTopAccentButton } from '@/components/tab-bar-button';
import { useAppState } from '@/state/app-provider';

export default function AppLayout() {
  const { currentAccount, currentUser, isHydrated } = useAppState();
  const theme = useTheme();

  if (!isHydrated) return null;
  if (!currentAccount || !currentUser) {
    // Sem sessao ativa, o onboarding e sempre o ponto de entrada, mesmo
    // para dispositivos que ja viram a tela de boas-vindas anteriormente.
    return <Redirect href="/boas-vindas" />;
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
