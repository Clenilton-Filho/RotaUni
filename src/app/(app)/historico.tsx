import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRideHistory } from '@/hooks/use-ride-history';

export default function HistoryScreen() {
  const router = useRouter();
  const { entries, isLoading, error } = useRideHistory();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="linkPrimary">‹ Voltar</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Histórico</ThemedText>
          {isLoading ? (
            <View style={styles.feedback}>
              <ActivityIndicator />
              <ThemedText themeColor="textSecondary">Carregando histórico...</ThemedText>
            </View>
          ) : error ? (
            <ThemedText style={styles.error}>{error}</ThemedText>
          ) : entries.length === 0 ? (
            <ThemedText themeColor="textSecondary">Você ainda não tem caronas realizadas.</ThemedText>
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
                  <ThemedView type="backgroundElement" style={styles.card}>
                  <ThemedText type="smallBold">{ride?.driver.name ?? 'Motorista indisponível'}</ThemedText>
                  {ride ? <ThemedText>{ride.vehicle} • {ride.vehicleColor}</ThemedText> : null}
                  <ThemedText>Destino: {ride?.destination ?? 'Indisponível'}</ThemedText>
                  <ThemedText>Horário: {ride?.departureTime ?? 'Indisponível'}</ThemedText>
                  <ThemedText>
                    {ride?.price === null ? 'Gratuita' : ride ? `R$ ${ride.price?.toFixed(2).replace('.', ',')}` : 'Preço indisponível'}
                  </ThemedText>
                  <ThemedText style={rating ? styles.rated : styles.notRated}>
                    {rating ? `★ ${rating.stars}/5` : 'Não avaliada'}
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
  content: { padding: 20, gap: 18 },
  list: { gap: 12 },
  card: { gap: 6, padding: 16, borderRadius: 10 },
  rated: { color: '#B76E00', fontWeight: '700' },
  notRated: { color: '#60646C' },
  feedback: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  error: { color: '#B42318' },
});