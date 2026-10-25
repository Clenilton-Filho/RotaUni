import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InfoBadge } from '@/components/info-badge';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { UserAvatar } from '@/components/user-avatar';
import { useRideHistory } from '@/hooks/use-ride-history';
import { useTheme } from '@/hooks/use-theme';

export default function HistoryScreen() {
  const router = useRouter();
  const { entries, isLoading, error } = useRideHistory();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title="Histórico" />
          {isLoading ? (
            <View style={styles.feedback}>
              <ActivityIndicator />
              <ThemedText themeColor="textSecondary">Carregando histórico...</ThemedText>
            </View>
          ) : error ? (
            <ThemedText style={styles.error}>{error}</ThemedText>
          ) : entries.length === 0 ? (
            <ThemedText style={styles.empty} themeColor="textSecondary">
              Você ainda não tem caronas realizadas.
            </ThemedText>
          ) : (
            <View style={styles.list}>
              {entries.map(({ history, ride, rating }) => (
                <Pressable
                  key={history.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/historico/[rideId]',
                      params: { rideId: history.rideId },
                    } as unknown as Href)
                  }>
                  <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.backgroundSelected }]}>
                    <View style={styles.cardTop}>
                      <UserAvatar name={ride?.driver.name ?? 'Motorista'} />
                      <View style={styles.cardInfo}>
                        <ThemedText type="smallBold" style={styles.driverName}>
                          {ride?.driver.name ?? 'Motorista indisponível'}
                        </ThemedText>
                        <ThemedText themeColor="textSecondary">
                          {ride ? `${ride.vehicle} • ${ride.vehicleColor}` : null}
                        </ThemedText>
                        <ThemedText themeColor="textSecondary">
                          {ride ? `Destino: ${ride.destination}` : null}
                        </ThemedText>
                      </View>
                      {rating ? (
                        <InfoBadge label={`★ ${rating.stars}/5`} tone="accent" />
                      ) : (
                        <InfoBadge label="Não avaliada" tone="neutral" />
                      )}
                    </View>
                    <ThemedText themeColor="textSecondary">
                      Saída: {ride?.departureTime ?? 'Indisponível'} •{' '}
                      {ride?.price === null ? 'Gratuita' : ride ? `R$ ${ride.price?.toFixed(2).replace('.', ',')}` : 'Preço indisponível'}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
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
  content: { paddingBottom: 32, gap: 14 },
  list: { gap: 14, padding: 20 },
  card: { gap: 10, padding: 16, borderRadius: 16, borderWidth: 1 },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cardInfo: { flex: 1, gap: 3 },
  driverName: { fontSize: 16, lineHeight: 22 },
  feedback: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  empty: { marginHorizontal: 20 },
  error: { color: Colors.light.destructive, marginHorizontal: 20 },
});
