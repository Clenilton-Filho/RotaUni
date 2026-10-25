import { Pressable, StyleSheet, View } from 'react-native';

import { InfoBadge } from '@/components/info-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import {
  getRemainingSeats,
  getRideCapacityStatus,
  type Ride,
} from '@/domain/rides/ride.types';
import { useTheme } from '@/hooks/use-theme';

type RideCardProps = {
  ride: Ride;
  onPress?: () => void;
};

export function RideCard({ ride, onPress }: RideCardProps) {
  const theme = useTheme();
  const status = getRideCapacityStatus(ride);
  const remainingSeats = getRemainingSeats(ride);

  const card = (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.backgroundSelected }]}>
      <UserAvatar name={ride.driver.name} />

      <View style={styles.info}>
        <ThemedText type="smallBold" style={styles.driverName}>
          {ride.driver.name}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {ride.vehicle} • {ride.vehicleColor}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.detail}>
          {ride.destination} • Saída {ride.departureTime} • {remainingSeats === 1 ? '1 vaga' : `${remainingSeats} vagas`}
        </ThemedText>
      </View>

      <View style={styles.right}>
        <ThemedText style={styles.time}>{ride.departureTime}</ThemedText>
        <ThemedText style={[styles.price, { color: theme.accent }]}>
          {ride.price === null ? 'Gratuita' : `R$ ${ride.price.toFixed(2).replace('.', ',')}`}
        </ThemedText>
        {status === 'full' ? <InfoBadge label="Lotada" tone="accent" /> : null}
        {status === 'almost-full' ? <InfoBadge label="Quase cheia" tone="accent" /> : null}
      </View>
    </ThemedView>
  );

  if (!onPress) return card;

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  info: { flex: 1, gap: 4 },
  driverName: {
    fontSize: 16,
    lineHeight: 22,
  },
  detail: { fontSize: 13, lineHeight: 18 },
  right: { alignItems: 'flex-end', gap: 4 },
  time: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  price: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
});
