import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppShell } from '@/components/app-shell';
import { AppProvider } from '@/state/app-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <SafeAreaProvider>
        <AppProvider>
          <AppShell>
            <AnimatedSplashOverlay />
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="dark" />
          </AppShell>
        </AppProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
