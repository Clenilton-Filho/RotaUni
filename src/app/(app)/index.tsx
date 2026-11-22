import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { InfoBadge } from '@/components/info-badge';
import { RideCard } from '@/components/rides/ride-card';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useActiveBookingSync } from '@/hooks/use-active-booking-sync';
import { useAvailableRides } from '@/hooks/use-available-rides';
import { useRide } from '@/hooks/use-ride';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-provider';

export default function HomeScreen() {
  const { currentUser, currentBooking, clearBooking } = useAppState();
  const { rides, isLoading, error, refetch: refetchRides } = useAvailableRides();
  const { ride: bookedRide } = useRide(currentBooking?.rideId);
  useActiveBookingSync();
  const theme = useTheme();

  // Fase C (sincronizacao em tempo real): a cada mudanca da reserva ativa
  // (foco/polling) recarrega a listagem em silencio, garantindo que a carona
  // iniciada (IN_PROGRESS) saia de "Caronas disponiveis" e as vagas fiquem
  // sempre sincronizadas. Em mock os dados sao estaticos: refetch nao muda nada.
  useEffect(() => {
    void refetchRides();
  }, [currentBooking, refetchRides]);

  if (!currentUser) return null;

  const bookingStatus = currentBooking?.status;
  const bookingBadge =
    bookingStatus === 'pending' ? (
      <InfoBadge label="Aguardando confirmação do motorista" tone="accent" />
    ) : bookingStatus === 'confirmed' && bookedRide?.status === 'in_progress' ? (
      <InfoBadge label="Viagem em andamento" tone="success" />
    ) : bookingStatus === 'confirmed' ? (
      <InfoBadge label="Aguardando saída do motorista" tone="success" />
    ) : (
      <InfoBadge label="Solicitação recusada" tone="neutral" />
    );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Fase D: este cabecalho descreve o perfil, nao a origem de uma
              carona especifica — a origem real aparece na tela de detalhes. */}
          <ScreenHeader
            title={`Olá, ${currentUser.name}!`}
            subtitle={`Faculdade: ${currentUser.university} • ${currentUser.campus}`} />

          {/* Fase C: motorista encerrou a viagem pelo finish — a reserva saiu
              do /active e virou historico pronto para avaliacao. */}
          {currentBooking && currentBooking.status === 'rejected' ? (
            <ThemedView type="backgroundElement" style={[styles.currentBooking, { borderColor: theme.backgroundSelected }]}>
              {bookingBadge}
              <ThemedText type="smallBold">Solicitação recusada</ThemedText>
              <ThemedText>
                O motorista não pôde aceitar sua solicitação. Você já pode buscar outra carona.
              </ThemedText>
              <AppButton
                title="Entendi, buscar outra carona"
                disabled={false}
                onPress={() => void clearBooking()}
              />
            </ThemedView>
          ) : currentBooking && bookedRide ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/caronas/[rideId]',
                  params: { rideId: currentBooking.rideId },
                })
              }
              style={styles.currentBookingPressable}>
              <ThemedView type="backgroundElement" style={[styles.currentBooking, { borderColor: theme.backgroundSelected }]}>
                {bookingBadge}
                <ThemedText type="smallBold">
                  {bookingStatus === 'pending' ? 'Carona solicitada' : 'Carona reservada'}
                </ThemedText>
                <ThemedText>
                  {bookedRide.driver.name} • {bookedRide.destination} às {bookedRide.departureTime}
                </ThemedText>
                <ThemedText style={styles.hint} themeColor="textSecondary">
                  Toque para ver os detalhes
                </ThemedText>
              </ThemedView>
            </Pressable>
          ) : null}

          <ThemedText style={styles.sectionTitle}>
            Caronas disponíveis
          </ThemedText>

          {isLoading ? (
            <View style={styles.feedback}>
              <ActivityIndicator />
              <ThemedText themeColor="textSecondary">Carregando caronas...</ThemedText>
            </View>
          ) : error ? (
            <ThemedText style={styles.error}>{error}</ThemedText>
          ) : rides.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              Nenhuma carona encontrada para este momento.
            </ThemedText>
          ) : (
            <View style={styles.ridesList}>
              {rides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onPress={() =>
                    router.push({ pathname: '/caronas/[rideId]', params: { rideId: ride.id } })
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingBottom: 32, gap: 20 },
  currentBookingPressable: { marginHorizontal: 20, borderRadius: 16 },
  currentBooking: { gap: 8, padding: 16, borderRadius: 16, borderWidth: 1 },
  endedActions: { gap: 8 },
  hint: { fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700', paddingHorizontal: 20 },
  ridesList: { gap: 14, paddingHorizontal: 20 },
  feedback: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  error: { color: Colors.light.destructive, paddingHorizontal: 20 },
});
