export type Driver = {
  id: string;
  name: string;
  rating: number | null;
};

export type RideStatus = 'open' | 'in_progress' | 'finished' | 'completed' | 'cancelled';

export type Ride = {
  id: string;
  driver: Driver;
  vehicle: string;
  vehicleColor: string;
  departureTime: string;
  destination: string;
  totalCapacity: number;
  confirmedPassengers: number;
  passengerNames: string[];
  price: number | null;
  status: RideStatus;
  university: string;
  campus: string;
};

export type RideCapacityStatus = 'available' | 'almost-full' | 'full';

export function getRemainingSeats(ride: Ride) {
  return Math.max(ride.totalCapacity - ride.confirmedPassengers, 0);
}

export function getRideCapacityStatus(ride: Ride): RideCapacityStatus {
  const remainingSeats = getRemainingSeats(ride);

  if (remainingSeats === 0) return 'full';
  if (remainingSeats === 1) return 'almost-full';
  return 'available';
}
