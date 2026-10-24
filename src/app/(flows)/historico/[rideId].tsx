import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { InfoBadge } from '@/components/info-badge';
import { PersistentTabBar } from '@/components/persistent-tab-bar';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import { useRating } from '@/hooks/use-rating';
import { useRide } from '@/hooks/use-ride';
import { useRideHistory } from '@/hooks/use-ride-history';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-provider';

export default function HistoryRideDetailsScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { currentUser } = useAppState();
  const { ride, isLoading: isRideLoading } = useRide(rideId);
  const { entries, isLoading: isHistoryLoading } = useRideHistory();
  const { rating } = useRating(rideId);
  const theme = useTheme();

  const historyEntry = entries.find((entry) => entry.history.rideId === rideId);

  if (isRideLoading || isHistoryLoading) {
    return <FeedbackMessage message="Carregando histórico..." showActivity />;
  }

  if (!currentUser || !historyEntry || !ride) {
    return <FeedbackMessage message="Experiência não encontrada." />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <ScreenHeader
            title="Carona finalizada"
            subtitle="Esta experiência já foi registrada no histórico."
            fallbackHref="/historico"
          />

          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.backgroundSelected }]}>
            <View style={styles.driverRow}>
              <UserAvatar name={ride.driver.name} />
              <View style={styles.driverInfo}>
                <ThemedText type="smallBold" style={styles.driverName}>
                  {ride.driver.name}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  ★ {ride.driver.rating.toFixed(1)} no perfil do motorista
                </ThemedText>
              </View>
            </View>
            <View style={styles.details}>
              <ThemedText>{ride.vehicle} • {ride.vehicleColor}</ThemedText>
              <ThemedText>Origem: {currentUser.campus}</ThemedText>
              <ThemedText>Destino: {ride.destination}</ThemedText>
              <ThemedText>Saída: {ride.departureTime}</ThemedText>
              <ThemedText style={styles.price}>
                {ride.price === null ? 'Gratuita' : `R$ ${ride.price.toFixed(2).replace('.', ',')}`}
              </ThemedText>
            </View>

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
          </ThemedView>
        </ScrollView>

        <PersistentTabBar activeTab="historico" />
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
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/historico') as unknown as Href)}>
            <ThemedText type="linkPrimary">Voltar</ThemedText>
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
  card: { gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, marginHorizontal: 20 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverInfo: { flex: 1, gap: 3 },
  driverName: { fontSize: 16, lineHeight: 22 },
  details: { gap: 5 },
  price: { fontWeight: '700' },
  feedback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});
