import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { PersistentTabBar } from '@/components/persistent-tab-bar';
import { ScreenHeader } from '@/components/screen-header';
import { UserAvatar } from '@/components/user-avatar';
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
    return <FeedbackMessage message="Não há uma reserva válida para avaliar." rideId={rideId} />;
  }

  if (isRideLoading || isRatingLoading || isHistoryLoading) {
    return <FeedbackMessage message="Carregando avaliação..." showActivity />;
  }

  const hasActiveBooking = currentBooking?.rideId === rideId && currentBooking.userId === currentUser.userId;
  const hasCompletedRide = entries.some((entry) => entry.history.rideId === rideId);

  if (!hasActiveBooking && !hasCompletedRide) {
    return <FeedbackMessage message="Não há uma reserva válida para avaliar." rideId={rideId} />;
  }

  if (!ride) {
    return <FeedbackMessage message="Carona não encontrada." rideId={rideId} />;
  }

  const displayedStars = selectedStars ?? rating?.stars ?? null;
  const isAlreadyRated = rating !== null;
  const driverFirstName = ride.driver.name.trim().split(/\s+/)[0];

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
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <ScreenHeader
            title="Avaliar motorista"
            subtitle={`Carona até ${ride.destination}`}
            fallbackHref={`/carona-finalizada?rideId=${rideId}`}
          />

          <View style={styles.ratingSection}>
            <UserAvatar name={ride.driver.name} size={72} />
            <ThemedText type="subtitle" style={styles.question}>
              Como foi a carona com {driverFirstName}?
            </ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText themeColor="textSecondary">
                {ride.vehicle} • {ride.vehicleColor} • Origem: {currentUser.campus}
              </ThemedText>
            </View>

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

          <AppButton
            title={isSubmitting ? 'Enviando...' : isAlreadyRated ? 'Avaliação registrada' : 'Enviar avaliação'}
            disabled={displayedStars === null || isAlreadyRated || isSubmitting}
            onPress={handleSubmit}
          />
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        </ScrollView>

        <PersistentTabBar activeTab="caronas" />
      </SafeAreaView>
    </ThemedView>
  );
}

function FeedbackMessage({
  message,
  showActivity = false,
  rideId,
}: {
  message: string;
  showActivity?: boolean;
  rideId?: string;
}) {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.feedback}>
          {showActivity ? <ActivityIndicator /> : null}
          <ThemedText themeColor="textSecondary">{message}</ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace({
                  pathname: '/carona-finalizada',
                  params: rideId ? { rideId } : {},
                } as unknown as Href);
              }
            }}>
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
  ratingSection: { alignItems: 'center', gap: 12, paddingVertical: 16, marginHorizontal: 20 },
  question: { fontSize: 20, lineHeight: 26, textAlign: 'center' },
  summaryRow: { alignItems: 'center' },
  stars: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  star: { color: '#C7CEDB', fontSize: 40, lineHeight: 48 },
  selectedStar: { color: '#C2410C' },
  evaluatedText: { color: '#18794E', fontWeight: '700' },
  error: { color: '#B42318', marginHorizontal: 20 },
  feedback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});
