import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  getRemainingSeats,
  getRideCapacityStatus,
  type Ride,
} from '@/domain/rides/ride.types';

type RideCardProps = {
  ride: Ride;
};

export function RideCard({ ride }: RideCardProps) {
  const status = getRideCapacityStatus(ride);
  const remainingSeats = getRemainingSeats(ride);
  const statusLabel = {
    available: 'Disponível',
    'almost-full': 'Quase cheia',
    full: 'Lotada',
  }[status];

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.driverInfo}>
          <ThemedText type="smallBold">{ride.driver.name}</ThemedText>
          <ThemedText style={styles.rating}>★ {ride.driver.rating.toFixed(1)}</ThemedText>
        </View>
        <ThemedText style={[styles.status, status === 'full' && styles.fullStatus]}>
          {statusLabel}
        </ThemedText>
      </View>

      <ThemedText themeColor="textSecondary">
        {ride.vehicle} • {ride.vehicleColor}
      </ThemedText>

      <View style={styles.details}>
        <ThemedText>Saída {ride.departureTime}</ThemedText>
        <ThemedText>Destino: {ride.destination}</ThemedText>
        <ThemedText>
          Passageiros: {ride.confirmedPassengers}/{ride.totalCapacity}
          {status !== 'full' ? ` • ${remainingSeats} ${remainingSeats === 1 ? 'vaga' : 'vagas'}` : ''}
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <ThemedText type="smallBold">
          {ride.price === null ? 'Gratuita' : `R$ ${ride.price.toFixed(2).replace('.', ',')}`}
        </ThemedText>
        {status === 'full' ? (
          <ThemedText themeColor="textSecondary" type="small">
            Sem vagas para escolha
          </ThemedText>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 18, borderRadius: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  driverInfo: { gap: 4, flex: 1 },
  rating: { color: '#B76E00', fontWeight: '700' },
  status: { color: '#18794E', fontSize: 13, fontWeight: '700' },
  fullStatus: { color: '#B42318' },
  details: { gap: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
});