import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RideCard } from '@/components/rides/ride-card';
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
          <View style={styles.header}>
            <ThemedText type="subtitle">Olá, {currentUser.name}!</ThemedText>
            <ThemedText themeColor="textSecondary">Saindo de:</ThemedText>
            <ThemedText type="smallBold">{currentUser.campus}</ThemedText>
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
              <ThemedView
                type="backgroundElement"
                style={[styles.currentBooking, { borderColor: theme.backgroundSelected }]}>
                <ThemedText type="smallBold">Carona escolhida</ThemedText>
                <ThemedText>
                  {bookedRide.driver.name} • {bookedRide.destination} às {bookedRide.departureTime}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Toque para ver os detalhes
                </ThemedText>
              </ThemedView>
            </Pressable>
          ) : null}

          <ThemedText type="subtitle" style={styles.sectionTitle}>
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
  content: { padding: 24, gap: 20 },
  header: { gap: 6 },
  currentBookingPressable: { borderRadius: 10 },
  currentBooking: { gap: 5, padding: 16, borderRadius: 10, borderWidth: 1 },
  sectionTitle: { fontSize: 24, lineHeight: 32 },
  ridesList: { gap: 14 },
  feedback: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  error: { color: '#B42318' },
});