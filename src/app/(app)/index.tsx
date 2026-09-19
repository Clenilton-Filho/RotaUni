import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RideCard } from '@/components/rides/ride-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAvailableRides } from '@/hooks/use-available-rides';
import { useAppState } from '@/state/app-provider';

export default function HomeScreen() {
  const { currentUser } = useAppState();
  const { rides, isLoading, error } = useAvailableRides();

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
  sectionTitle: { fontSize: 24, lineHeight: 32 },
  ridesList: { gap: 14 },
  feedback: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  error: { color: '#B42318' },
});