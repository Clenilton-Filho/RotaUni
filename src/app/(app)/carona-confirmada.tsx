import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFinalizeRide } from '@/hooks/use-finalize-ride';
import { useRide } from '@/hooks/use-ride';
import { useAppState } from '@/state/app-provider';

export default function RideConfirmedScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { clearBooking, currentBooking, currentUser } = useAppState();
  const { ride, isLoading } = useRide(rideId);
  const { finalizeRide, isFinalizing, error: finalizeError } = useFinalizeRide();
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
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Carona escolhida</ThemedText>
            <ThemedText style={styles.confirmation}>
              Sua escolha foi confirmada localmente.
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.summary}>
            <ThemedText type="smallBold">{ride.driver.name}</ThemedText>
            <ThemedText style={styles.rating}>★ {ride.driver.rating.toFixed(1)}</ThemedText>
            <View style={styles.details}>
              <ThemedText>
                {ride.vehicle} • {ride.vehicleColor}
              </ThemedText>
              <ThemedText>Saída: {ride.departureTime}</ThemedText>
              <ThemedText>Origem: {currentUser.campus}</ThemedText>
              <ThemedText>Destino: {ride.destination}</ThemedText>
              <ThemedText type="smallBold">
                {ride.price === null ? 'Gratuita' : `R$ ${ride.price.toFixed(2).replace('.', ',')}`}
              </ThemedText>
            </View>
          </ThemedView>

          <ThemedText themeColor="textSecondary">
            Esta é a carona atualmente escolhida para o seu perfil.
          </ThemedText>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/')}
            style={styles.button}>
            <ThemedText style={styles.buttonText}>Voltar para a Home</ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
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
            style={styles.finalizeButton}>
            <ThemedText style={styles.finalizeText}>
              {isFinalizing ? 'Finalizando...' : 'Finalizar carona'}
            </ThemedText>
          </Pressable>
          {finalizeError ? <ThemedText style={styles.error}>{finalizeError}</ThemedText> : null}

          <Pressable
            accessibilityRole="button"
            disabled={isCancelling}
            onPress={() => {
              Alert.alert('Cancelar reserva', 'Deseja cancelar a carona escolhida?', [
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
            style={styles.cancelButton}>
            <ThemedText style={styles.cancelText}>
              {isCancelling ? 'Cancelando...' : 'Cancelar reserva'}
            </ThemedText>
          </Pressable>
        </ScrollView>
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
          <Pressable accessibilityRole="button" onPress={onBack ?? (() => router.back())}>
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
  content: { padding: 20, gap: 18 },
  header: { gap: 6 },
  confirmation: { color: '#18794E', fontWeight: '700' },
  summary: { gap: 10, padding: 18, borderRadius: 10 },
  rating: { color: '#B76E00', fontWeight: '700' },
  details: { gap: 5 },
  button: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 15 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  cancelButton: { alignItems: 'center', padding: 12 },
  cancelText: { color: '#B42318', fontWeight: '700' },
  finalizeButton: { alignItems: 'center', padding: 12 },
  finalizeText: { color: '#18794E', fontWeight: '700' },
  error: { color: '#B42318' },
  feedback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});