import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRating } from '@/hooks/use-rating';
import { useRide } from '@/hooks/use-ride';
import { useRideHistory } from '@/hooks/use-ride-history';
import { useAppState } from '@/state/app-provider';

export default function HistoryRideDetailsScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { currentUser } = useAppState();
  const { ride, isLoading: isRideLoading } = useRide(rideId);
  const { entries, isLoading: isHistoryLoading } = useRideHistory();
  const { rating } = useRating(rideId);

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
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="linkPrimary">‹ Voltar</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Carona finalizada</ThemedText>
          <ThemedText themeColor="textSecondary">Esta experiência já foi registrada no histórico.</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{ride.driver.name}</ThemedText>
            <ThemedText>★ {ride.driver.rating.toFixed(1)} no perfil do motorista</ThemedText>
            <ThemedText>{ride.vehicle} • {ride.vehicleColor}</ThemedText>
            <ThemedText>Origem: {currentUser.campus}</ThemedText>
            <ThemedText>Destino: {ride.destination}</ThemedText>
            <ThemedText>Saída: {ride.departureTime}</ThemedText>
            <ThemedText>
              {ride.price === null ? 'Gratuita' : `R$ ${ride.price.toFixed(2).replace('.', ',')}`}
            </ThemedText>
          </ThemedView>

          {rating ? (
            <ThemedText style={styles.rated}>✓ Motorista avaliado ({rating.stars}/5)</ThemedText>
          ) : (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/avaliar-carona/[rideId]',
                  params: { rideId },
                } as unknown as Href)
              }
              style={styles.button}>
              <ThemedText style={styles.buttonText}>Avaliar motorista</ThemedText>
            </Pressable>
          )}
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
          <Pressable onPress={() => router.back()}>
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
  content: { padding: 20, gap: 18 },
  card: { gap: 7, padding: 18, borderRadius: 10 },
  button: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 15 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  rated: { color: '#18794E', fontWeight: '700', textAlign: 'center' },
  feedback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});