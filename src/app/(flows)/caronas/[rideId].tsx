import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { InfoBadge } from '@/components/info-badge';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import { Colors } from '@/constants/theme';
import {
  getRemainingSeats,
  getRideCapacityStatus,
} from '@/domain/rides/ride.types';
import { useCreateBooking } from '@/hooks/use-create-booking';
import { useFinalizeRide } from '@/hooks/use-finalize-ride';
import { useRide } from '@/hooks/use-ride';
import { useRideHistory } from '@/hooks/use-ride-history';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-provider';
import { confirmAlert } from '@/utils/confirm-alert';

export default function RideDetailsScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { clearBooking, currentUser, currentBooking } = useAppState();
  const { ride, isLoading, error } = useRide(rideId);
  const { createBooking, isSaving, error: bookingError } = useCreateBooking();
  const { finalizeRide, isFinalizing, error: finalizeError } = useFinalizeRide();
  const { entries: historyEntries, isLoading: isHistoryLoading } = useRideHistory();
  const theme = useTheme();
  const [isCancelling, setIsCancelling] = useState(false);

  if (!currentUser) return null;

  if (isLoading) {
    return <FeedbackMessage message="Carregando detalhes da carona..." showActivity />;
  }

  if (isHistoryLoading) {
    return <FeedbackMessage message="Carregando situação da carona..." showActivity />;
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
  const isFinalizedRide = historyEntries.some((entry) => entry.history.rideId === ride.id);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            title={isSelectedRide ? 'Carona reservada' : 'Detalhes da carona'}
            subtitle={isSelectedRide ? 'Sua reserva foi confirmada.' : `Saindo de ${currentUser.campus}`}
            fallbackHref="/"
          />

          <SectionCard>
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
              <ThemedText style={[styles.driverRating, { color: theme.accent }]}>
                ★ {ride.driver.rating.toFixed(1)}
              </ThemedText>
            </View>
          </SectionCard>

          {isSelectedRide ? (
            <View style={styles.confirmBadgeRow}>
              <InfoBadge label="Confirmada" tone="success" />
            </View>
          ) : null}

          <SectionCard>
            <ThemedText type="smallBold">Saída: {ride.departureTime}</ThemedText>
            <View style={styles.routeList}>
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: theme.primary }]} />
                <ThemedText style={styles.routeLabel}>
                  Origem: {currentUser.campus}
                </ThemedText>
              </View>
              <View style={[styles.routeConnector, { backgroundColor: theme.primary }]} />
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: theme.accent }]} />
                <ThemedText style={styles.routeLabel}>
                  Destino: {ride.destination}
                </ThemedText>
              </View>
            </View>
          </SectionCard>

          <View style={styles.statsRow}>
            <SectionCard style={styles.statCard}>
              <ThemedText themeColor="textSecondary">Vagas</ThemedText>
              <ThemedText type="subtitle">{remainingSeats}</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.statCaption}>
                {status === 'full'
                  ? 'Lotada. Não há vagas disponíveis.'
                  : status === 'almost-full'
                    ? `Quase cheia. ${remainingSeats} vaga restante.`
                    : 'Disponíveis.'}
              </ThemedText>
            </SectionCard>
            <SectionCard style={styles.statCard}>
              <ThemedText themeColor="textSecondary">Valor</ThemedText>
              <ThemedText type="subtitle">
                {ride.price === null ? 'Gratuita' : `R$ ${ride.price.toFixed(2).replace('.', ',')}`}
              </ThemedText>
            </SectionCard>
          </View>

          <SectionCard title={`Passageiros confirmados (${ride.confirmedPassengers}/${ride.totalCapacity})`}>
            {ride.passengerNames.length > 0 ? (
              ride.passengerNames.map((passengerName) => (
                <ThemedText key={passengerName}>• {passengerName}</ThemedText>
              ))
            ) : (
              <ThemedText themeColor="textSecondary">Nenhum passageiro confirmado.</ThemedText>
            )}
          </SectionCard>

          {isFinalizedRide && !isSelectedRide ? (
            <View style={styles.finalizedAction}>
              <InfoBadge label="Carona finalizada" tone="neutral" />
              <ThemedText themeColor="textSecondary">
                Esta experiência está disponível no Histórico.
              </ThemedText>
            </View>
          ) : isSelectedRide ? (
            <View style={styles.currentBookingAction}>
              <AppButton title={isFinalizing ? 'Finalizando...' : 'Finalizar carona'} disabled={isFinalizing} onPress={async () => {
                const finalized = await finalizeRide();
                if (finalized) {
                  router.replace({
                    pathname: '/carona-finalizada',
                    params: { rideId },
                  } as unknown as Href);
                }
              }} />
              <AppButton title={isCancelling ? 'Cancelando...' : 'Cancelar reserva'} disabled={isCancelling} variant="destructive" onPress={() => {
                confirmAlert('Cancelar reserva', 'Deseja cancelar reserva da carona?', [
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
              }} />
            </View>
          ) : (
            <View style={styles.actionContainer}>
              <AppButton
                title={status === 'full'
                  ? 'Sem vagas'
                  : hasCurrentBooking
                    ? 'Você já possui uma carona reservada'
                    : isSaving
                      ? 'Salvando reserva...'
                      : 'Reservar esta carona'}
                disabled={status === 'full' || hasCurrentBooking || isSaving}
                onPress={async () => {
                  const wasCreated = await createBooking(ride.id);
                  if (wasCreated) {
                    router.replace({
                      pathname: '/caronas/[rideId]',
                      params: { rideId: ride.id },
                    } as unknown as Href);
                  }
                }}
              />
            </View>
          )}
          {bookingError ? <ThemedText style={styles.error}>{bookingError}</ThemedText> : null}
          {finalizeError ? <ThemedText style={styles.error}>{finalizeError}</ThemedText> : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SectionCard({ title, children, style }: { title?: string; children: React.ReactNode; style?: object }) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.section, style ?? {}, { borderColor: theme.backgroundSelected }]}>
      {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
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
          <Pressable
            accessibilityRole="button"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/') as unknown as Href)}>
            <ThemedText type="linkPrimary">‹ Voltar para a listagem</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingBottom: 32, gap: 14 },
  section: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 20,
  },
  sectionContent: { gap: 6 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverInfo: { flex: 1, gap: 3 },
  driverName: { fontSize: 16, lineHeight: 22 },
  driverRating: { fontWeight: '700', fontSize: 14 },
  routeList: { gap: 0 },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeDot: { width: 14, height: 14, borderRadius: 7 },
  routeConnector: { width: 3, height: 22, marginLeft: 5.5, borderRadius: 2 },
  routeLabel: {
    fontWeight: '700',
    flex: 1,
  },
  confirmBadgeRow: { marginHorizontal: 20 },
  statsRow: { flexDirection: 'row', gap: 14, marginHorizontal: 20 },
  statCard: { flex: 1, marginHorizontal: 0 },
  statCaption: { fontSize: 13, lineHeight: 18 },
  finalizedAction: { alignItems: 'center', gap: 8, paddingVertical: 8, marginHorizontal: 20 },
  currentBookingAction: { gap: 12, marginHorizontal: 20 },
  actionContainer: { marginHorizontal: 20 },
  error: { color: Colors.light.destructive, marginHorizontal: 20 },
  feedback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});
