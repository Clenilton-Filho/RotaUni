import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { type RatingStars } from '@/domain/rating/rating.types';
import { useRating } from '@/hooks/use-rating';
import { useRide } from '@/hooks/use-ride';
import { useRideHistory } from '@/hooks/use-ride-history';
import { useAppState } from '@/state/app-provider';

const starOptions: RatingStars[] = [1, 2, 3, 4, 5];

export default function RateRideScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { currentBooking, currentUser } = useAppState();
  const { ride, isLoading: isRideLoading } = useRide(rideId);
  const { rating, isLoading: isRatingLoading, isSubmitting, error, submitRating } = useRating(rideId);
  const { entries, isLoading: isHistoryLoading } = useRideHistory();
  const [selectedStars, setSelectedStars] = useState<RatingStars | null>(null);

  if (!currentUser) {
    return <FeedbackMessage message="Não há uma reserva válida para avaliar." />;
  }

  if (isRideLoading || isRatingLoading || isHistoryLoading) {
    return <FeedbackMessage message="Carregando avaliação..." showActivity />;
  }

  const hasActiveBooking = currentBooking?.rideId === rideId && currentBooking.userId === currentUser.id;
  const hasCompletedRide = entries.some((entry) => entry.history.rideId === rideId);

  if (!hasActiveBooking && !hasCompletedRide) {
    return <FeedbackMessage message="Não há uma reserva válida para avaliar." />;
  }

  if (!ride) {
    return <FeedbackMessage message="Carona não encontrada." />;
  }

  const displayedStars = selectedStars ?? rating?.stars ?? null;
  const isAlreadyRated = rating !== null;

  async function handleSubmit() {
    if (!displayedStars || isAlreadyRated) return;

    const savedRating = await submitRating(displayedStars);

    if (savedRating) {
      router.replace({
        pathname: '/carona-finalizada',
        params: { rideId },
      } as unknown as Href);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <ThemedText type="linkPrimary">‹ Voltar</ThemedText>
          </Pressable>

          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>Avaliar motorista</ThemedText>
            <ThemedText themeColor="textSecondary">
              Registre sua avaliação para esta carona.
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.summary}>
            <ThemedText type="smallBold">{ride.driver.name}</ThemedText>
            <ThemedText>{ride.vehicle} • {ride.vehicleColor}</ThemedText>
            <ThemedText>Destino: {ride.destination}</ThemedText>
            <ThemedText>Origem: {currentUser.campus}</ThemedText>
          </ThemedView>

          <View style={styles.ratingSection}>
            <ThemedText type="smallBold">Sua avaliação</ThemedText>
            <View style={styles.stars}>
              {starOptions.map((star) => {
                const isSelected = displayedStars !== null && star <= displayedStars;

                return (
                  <Pressable
                    key={star}
                    accessibilityRole="button"
                    accessibilityLabel={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                    disabled={isAlreadyRated}
                    onPress={() => setSelectedStars(star)}>
                    <ThemedText style={[styles.star, isSelected && styles.selectedStar]}>
                      ★
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            {isAlreadyRated ? (
              <ThemedText style={styles.evaluatedText}>Motorista já avaliado.</ThemedText>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={displayedStars === null || isAlreadyRated || isSubmitting}
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              (displayedStars === null || isAlreadyRated || isSubmitting) && styles.disabledButton,
            ]}>
            <ThemedText style={styles.submitText}>
              {isSubmitting ? 'Enviando...' : isAlreadyRated ? 'Avaliação registrada' : 'Enviar avaliação'}
            </ThemedText>
          </Pressable>
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
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
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
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
  header: { gap: 6 },
  title: { fontSize: 28, lineHeight: 36 },
  summary: { gap: 7, padding: 18, borderRadius: 10 },
  ratingSection: { gap: 10, alignItems: 'center', paddingVertical: 8 },
  stars: { flexDirection: 'row', gap: 10 },
  star: { color: '#A0A0A0', fontSize: 38, lineHeight: 44 },
  selectedStar: { color: '#B76E00' },
  submitButton: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 15 },
  disabledButton: { backgroundColor: '#A0A0A0' },
  submitText: { color: '#FFFFFF', fontWeight: '700' },
  evaluatedText: { color: '#18794E', fontWeight: '700' },
  error: { color: '#B42318' },
  feedback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});