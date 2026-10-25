import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { InfoBadge } from '@/components/info-badge';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import { useRating } from '@/hooks/use-rating';
import { useRide } from '@/hooks/use-ride';
import { useRideHistory } from '@/hooks/use-ride-history';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-provider';

export default function RideFinishedScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { currentUser } = useAppState();
  const { ride, isLoading: isRideLoading } = useRide(rideId);
  const { entries, isLoading: isHistoryLoading } = useRideHistory();
  const { rating, isLoading: isRatingLoading } = useRating(rideId);
  const theme = useTheme();

  if (isRideLoading || isHistoryLoading || isRatingLoading) {
    return <FeedbackMessage message="Carregando carona finalizada..." showActivity />;
  }

  const isFinished = entries.some((entry) => entry.history.rideId === rideId);

  if (!currentUser || !rideId || !ride || !isFinished) {
    return <FeedbackMessage message="Carona finalizada não encontrada." />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            title="Carona finalizada!"
            subtitle="A carona foi adicionada ao seu histórico."
          />

          <ThemedView type="backgroundElement" style={[styles.summary, { borderColor: theme.backgroundSelected }]}>
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
            </View>
            <View style={styles.details}>
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
              <ThemedText>Horário: {ride.departureTime}</ThemedText>
            </View>

          </ThemedView>

          <View style={styles.actions}>
            {rating ? (
              <InfoBadge label={`✓ Motorista avaliado (${rating.stars}/5)`} tone="accent" />
            ) : (
              <AppButton
                title="Avaliar motorista"
                onPress={() =>
                  router.push({
                    pathname: '/avaliar-carona/[rideId]',
                    params: { rideId },
                  } as unknown as Href)
                }
              />
            )}
            <AppButton title="Voltar para Home" variant="outline" onPress={() => router.replace('/')} />
          </View>
        </ScrollView>
      </SafeAreaView>
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
          <Pressable accessibilityRole="button" onPress={() => router.replace('/')}>
            <ThemedText type="linkPrimary">Voltar para Home</ThemedText>
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
  summary: { gap: 20, padding: 16, borderRadius: 16, borderWidth: 1, marginHorizontal: 20 },
  actions: { gap: 14, marginHorizontal: 20 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverInfo: { flex: 1, gap: 3 },
  driverName: { fontSize: 16, lineHeight: 22 },
  details: { gap: 15 },
  feedback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  routeList: { gap: 0 },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeDot: { width: 14, height: 14, borderRadius: 7 },
  routeConnector: { width: 3, height: 22, marginLeft: 5.5, borderRadius: 2 },
  routeLabel: {
    fontWeight: '700',
    flex: 1,
  },
});
