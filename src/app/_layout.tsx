import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppShell } from '@/components/app-shell';
import { AppProvider } from '@/state/app-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <AppProvider>
          <AppShell>
            <AnimatedSplashOverlay />
            <Stack screenOptions={{ headerShown: false }} />
          </AppShell>
        </AppProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
