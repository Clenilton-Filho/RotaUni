import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-provider';
import { confirmAlert } from '@/utils/confirm-alert';

/**
 * O reset de desenvolvimento existe apenas no prototipo offline: ele limpa
 * os repositorios locais (AsyncStorage). No modo HTTP os dados residem no
 * servidor (o clearAll local e no-op por design), entao o botao fica
 * oculto — resta o "Sair da conta". Considera a MASTER e qualquer override
 * por modulo: bastando um modulo em HTTP para ocultar o reset.
 */
const isMockMode =
  process.env.EXPO_PUBLIC_DATA_SOURCE !== 'http' &&
  process.env.EXPO_PUBLIC_RIDES_DATA_SOURCE !== 'http' &&
  process.env.EXPO_PUBLIC_AUTH_DATA_SOURCE !== 'http' &&
  process.env.EXPO_PUBLIC_BOOKING_DATA_SOURCE !== 'http' &&
  process.env.EXPO_PUBLIC_HISTORY_DATA_SOURCE !== 'http' &&
  process.env.EXPO_PUBLIC_RATING_DATA_SOURCE !== 'http';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentAccount, currentUser, logout, resetLocalData } = useAppState();
  const theme = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!currentUser) return null;

  function confirmLogout() {
    confirmAlert('Sair da conta', 'O usuário e a reserva atual serão removidos deste aparelho.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          await logout();
          router.replace('/login' as Href);
        },
      },
    ]);
  }

  function confirmResetLocalData() {
    confirmAlert(
      'Resetar dados locais',
      'Isso removerá usuário, reserva, histórico e avaliações deste dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            await resetLocalData();
            router.replace('/login' as Href);
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title="Perfil" />

          <View style={styles.profileRow}>
            <UserAvatar name={currentUser.name} size={64} />
            <View style={styles.profileInfo}>
              <ThemedText type="smallBold" style={styles.profileName}>
                {currentUser.name}
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                {currentUser.university} • {currentUser.campus}
              </ThemedText>
            </View>
          </View>

          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.backgroundSelected }]}>
            <View style={styles.row}>
              <ThemedText type="smallBold">Email</ThemedText>
              <ThemedText>{currentAccount?.email}</ThemedText>
            </View>
          </ThemedView>

          <View style={styles.actions}>
            <AppButton title="Editar perfil" onPress={() => router.push('/perfil/editar' as Href)} />

            <AppButton
              title={isLoggingOut ? 'Saindo...' : 'Sair da conta'}
              variant="outline"
              disabled={isLoggingOut}
              onPress={confirmLogout}
            />

            {/* Reset apenas no prototipo offline (mock); em HTTP os dados
                residem no servidor e o "Sair da conta" e a saida. */}
            {isMockMode ? (
              <AppButton
                title={isResetting ? 'Resetando...' : 'Resetar dados locais'}
                variant="destructive"
                disabled={isResetting}
                onPress={confirmResetLocalData}
              />
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingBottom: 32, gap: 14 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 20 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, lineHeight: 24 },
  card: { gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, marginHorizontal: 20 },
  row: { gap: 4 },
  actions: { gap: 14, marginHorizontal: 20 },
});
