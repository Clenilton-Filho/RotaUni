import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { InfoBadge } from '@/components/info-badge';
import { PersistentTabBar } from '@/components/persistent-tab-bar';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import { useFinalizeRide } from '@/hooks/use-finalize-ride';
import { useRide } from '@/hooks/use-ride';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-provider';
import { confirmAlert } from '@/utils/confirm-alert';

export default function RideConfirmedScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { clearBooking, currentBooking, currentUser } = useAppState();
  const { ride, isLoading } = useRide(rideId);
  const { finalizeRide, isFinalizing, error: finalizeError } = useFinalizeRide();
  const theme = useTheme();
  const [isCancelling, setIsCancelling] = useState(false);

  if (!currentUser || !currentBooking || currentBooking.rideId !== rideId) {
    return (
      <FeedbackMessage
        message="Nenhuma carona escolhida foi encontrada."
        onBack={() => router.replace('/')}
      />
    );
  }

  if (isLoading || !ride) {
    return <FeedbackMessage message="Carregando carona escolhida..." />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <ScreenHeader title="Carona escolhida" subtitle="Sua escolha foi confirmada localmente." />

          <ThemedView type="backgroundElement" style={[styles.summary, { borderColor: theme.backgroundSelected }]}>
            <InfoBadge label="Confirmada" tone="success" />
            <View style={styles.driverRow}>
              <UserAvatar name={ride.driver.name} />
              <View style={styles.driverInfo}>
                <ThemedText type="smallBold" style={styles.driverName}>
                  {ride.driver.name}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {ride.vehicle} • {ride.vehicleColor}
                </ThemedText>
              </View>
              <ThemedText style={[styles.rating, { color: theme.accent }]}>
                ★ {ride.driver.rating.toFixed(1)}
              </ThemedText>
            </View>
            <View style={styles.details}>
              <ThemedText>Saída: {ride.departureTime}</ThemedText>
              <ThemedText>Origem: {currentUser.campus}</ThemedText>
              <ThemedText>Destino: {ride.destination}</ThemedText>
              <ThemedText style={styles.price}>
                {ride.price === null ? 'Gratuita' : `R$ ${ride.price.toFixed(2).replace('.', ',')}`}
              </ThemedText>
            </View>
            <ThemedText themeColor="textSecondary">
              Esta é a carona atualmente escolhida para o seu perfil.
            </ThemedText>
          </ThemedView>

          <AppButton
            title={isFinalizing ? 'Finalizando...' : 'Finalizar carona'}
            disabled={isFinalizing}
            onPress={async () => {
              const finalized = await finalizeRide();
              if (finalized) {
                router.replace({
                  pathname: '/carona-finalizada',
                  params: { rideId },
                } as unknown as Href);
              }
            }}
          />

          <AppButton
            title={isCancelling ? 'Cancelando...' : 'Cancelar reserva'}
            disabled={isCancelling}
            variant="outline"
            onPress={() => {
              confirmAlert('Cancelar reserva', 'Deseja cancelar a carona escolhida?', [
                { text: 'Manter reserva', style: 'cancel' },
                {
                  text: 'Cancelar reserva',
                  style: 'destructive',
                  onPress: async () => {
                    setIsCancelling(true);
                    await clearBooking();
                    router.replace('/');
                  },
                },
              ]);
            }}
          />

          <AppButton title="Voltar para a Home" variant="outline" onPress={() => router.replace('/')} />

          {finalizeError ? <ThemedText style={styles.error}>{finalizeError}</ThemedText> : null}
        </ScrollView>

        <PersistentTabBar activeTab="caronas" />
      </SafeAreaView>
    </ThemedView>
  );
}

function FeedbackMessage({ message, onBack }: { message: string; onBack?: () => void }) {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.feedback}>
          <ThemedText themeColor="textSecondary">{message}</ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={onBack ?? (() => router.canGoBack() ? router.back() : router.replace('/') as unknown as Href)}>
            <ThemedText type="linkPrimary">Voltar para a Home</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 12, gap: 14 },
  summary: { gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, marginHorizontal: 20 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverInfo: { flex: 1, gap: 3 },
  driverName: { fontSize: 16, lineHeight: 22 },
  rating: { fontWeight: '700', fontSize: 14 },
  details: { gap: 5 },
  price: { fontWeight: '700' },
  error: { color: '#B42318', marginHorizontal: 20 },
  feedback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});
