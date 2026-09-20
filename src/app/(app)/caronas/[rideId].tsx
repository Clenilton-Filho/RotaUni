import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
    getRemainingSeats,
    getRideCapacityStatus,
} from '@/domain/rides/ride.types';
import { useCreateBooking } from '@/hooks/use-create-booking';
import { useRide } from '@/hooks/use-ride';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-provider';

export default function RideDetailsScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { clearBooking, currentUser, currentBooking } = useAppState();
  const { ride, isLoading, error } = useRide(rideId);
  const { createBooking, isSaving, error: bookingError } = useCreateBooking();
  const theme = useTheme();
  const [isCancelling, setIsCancelling] = useState(false);

  if (!currentUser) return null;

  if (isLoading) {
    return <FeedbackMessage message="Carregando detalhes da carona..." showActivity />;
  }

  if (error) {
    return <FeedbackMessage message={error} />;
  }

  if (!ride) {
    return <FeedbackMessage message="Carona não encontrada." />;
  }

  const status = getRideCapacityStatus(ride);
  const remainingSeats = getRemainingSeats(ride);
  const hasCurrentBooking = currentBooking !== null;
  const isSelectedRide = currentBooking?.rideId === ride.id;
  const capacityMessage =
    status === 'full'
      ? 'Lotada. Não há vagas disponíveis.'
      : status === 'almost-full'
        ? `Quase cheia. Restam ${remainingSeats} vaga.`
        : `Disponível. Restam ${remainingSeats} vagas.`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <ThemedText type="linkPrimary">‹ Voltar</ThemedText>
          </Pressable>

          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              Detalhes da carona
            </ThemedText>
            <ThemedText themeColor="textSecondary">Saindo de {currentUser.campus}</ThemedText>
          </View>

          <DetailSection title="Motorista">
            <ThemedText type="smallBold">{ride.driver.name}</ThemedText>
            <ThemedText style={styles.rating}>★ {ride.driver.rating.toFixed(1)}</ThemedText>
          </DetailSection>

          <DetailSection title="Veículo">
            <ThemedText>{ride.vehicle}</ThemedText>
            <ThemedText themeColor="textSecondary">Cor: {ride.vehicleColor}</ThemedText>
          </DetailSection>

          <DetailSection title="Viagem">
            <ThemedText>Saída: {ride.departureTime}</ThemedText>
            <ThemedText>Origem: {currentUser.campus}</ThemedText>
            <ThemedText>Destino: {ride.destination}</ThemedText>
          </DetailSection>

          <DetailSection title="Capacidade">
            <ThemedText>
              {ride.confirmedPassengers}/{ride.totalCapacity} passageiros confirmados
            </ThemedText>
            <ThemedText style={status === 'full' ? styles.fullText : styles.availableText}>
              {capacityMessage}
            </ThemedText>
          </DetailSection>

          <DetailSection title="Passageiros confirmados">
            {ride.passengerNames.length > 0 ? (
              ride.passengerNames.map((passengerName) => (
                <ThemedText key={passengerName}>• {passengerName}</ThemedText>
              ))
            ) : (
              <ThemedText themeColor="textSecondary">Nenhum passageiro confirmado.</ThemedText>
            )}
          </DetailSection>

          <DetailSection title="Preço">
            <ThemedText type="smallBold">
              {ride.price === null ? 'Gratuita' : `R$ ${ride.price.toFixed(2).replace('.', ',')}`}
            </ThemedText>
          </DetailSection>

          {isSelectedRide ? (
            <View style={styles.currentBookingAction}>
              <ThemedText style={styles.selectedText}>✓ Carona escolhida</ThemedText>
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
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={status === 'full' || hasCurrentBooking || isSaving}
              onPress={async () => {
                const wasCreated = await createBooking(ride.id);
                if (wasCreated) {
                  router.replace({
                    pathname: '/carona-confirmada',
                    params: { rideId: ride.id },
                  } as unknown as Href);
                }
              }}
              style={[
                styles.actionButton,
                { shadowColor: theme.text },
                (status === 'full' || hasCurrentBooking || isSaving) && styles.disabledButton,
              ]}>
              <ThemedText style={styles.actionText}>
                {status === 'full'
                  ? 'Sem vagas'
                  : isSaving
                    ? 'Salvando escolha...'
                    : hasCurrentBooking
                      ? 'Você já possui uma carona escolhida'
                      : 'Escolher esta carona'}
              </ThemedText>
            </Pressable>
          )}
          {bookingError ? <ThemedText style={styles.error}>{bookingError}</ThemedText> : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.section, { borderColor: theme.backgroundSelected }]}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <View style={styles.sectionContent}>{children}</View>
    </ThemedView>
  );
}

function FeedbackMessage({ message, showActivity = false }: { message: string; showActivity?: boolean }) {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.feedback}>
          {showActivity ? <ActivityIndicator /> : null}
          <ThemedText themeColor="textSecondary">{message}</ThemedText>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <ThemedText type="linkPrimary">‹ Voltar para a Home</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: 20, gap: 14 },
  header: { gap: 4, paddingBottom: 4 },
  title: { fontSize: 28, lineHeight: 36 },
  section: {
    gap: 10,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7D9DE',
  },
  sectionContent: { gap: 5 },
  rating: { color: '#B76E00', fontWeight: '700' },
  availableText: { color: '#18794E', fontWeight: '700' },
  fullText: { color: '#B42318', fontWeight: '700' },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#208AEF',
    borderRadius: 8,
    padding: 15,
    marginTop: 2,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disabledButton: { backgroundColor: '#A0A0A0' },
  actionText: { color: '#FFFFFF', fontWeight: '700' },
  currentBookingAction: { alignItems: 'center', gap: 10, paddingVertical: 4 },
  selectedText: { color: '#18794E', fontWeight: '700' },
  cancelButton: { alignItems: 'center', padding: 12 },
  cancelText: { color: '#B42318', fontWeight: '700' },
  error: { color: '#B42318' },
  feedback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});