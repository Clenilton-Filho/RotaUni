import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InfoBadge } from '@/components/info-badge';
import { RideCard } from '@/components/rides/ride-card';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAvailableRides } from '@/hooks/use-available-rides';
import { useRide } from '@/hooks/use-ride';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-provider';

export default function HomeScreen() {
  const { currentUser, currentBooking } = useAppState();
  const { rides, isLoading, error } = useAvailableRides();
  const { ride: bookedRide } = useRide(currentBooking?.rideId);
  const theme = useTheme();

  if (!currentUser) return null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title={`Olá, ${currentUser.name}!`} subtitle={`Saindo de: ${currentUser.campus}`} />

          <View style={styles.headerActions}>
            <Pressable accessibilityRole="link" onPress={() => router.push('/perfil' as Href)}>
              <Text style={[styles.headerLink, { color: theme.accent }]}>Perfil</Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => router.push('/historico' as Href)}>
              <Text style={[styles.headerLink, { color: theme.accent }]}>Histórico</Text>
            </Pressable>
          </View>

          {currentBooking && bookedRide ? (
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
                <InfoBadge label="Confirmada" tone="success" />
                <ThemedText type="smallBold">Carona escolhida</ThemedText>
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
  headerActions: { flexDirection: 'row', gap: 24, paddingHorizontal: 20, marginTop: -10 },
  headerLink: { fontWeight: '700', fontSize: 16, lineHeight: 22 },
  currentBookingPressable: { marginHorizontal: 20, borderRadius: 16 },
  currentBooking: { gap: 8, padding: 16, borderRadius: 16, borderWidth: 1 },
  hint: { fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700', paddingHorizontal: 20 },
  ridesList: { gap: 14, paddingHorizontal: 20 },
  feedback: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  error: { color: '#B42318', paddingHorizontal: 20 },
});
