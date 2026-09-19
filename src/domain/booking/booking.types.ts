export type BookingStatus = 'confirmed';

export type Booking = {
  id: string;
  rideId: string;
  userId: string;
  status: BookingStatus;
  createdAt: string;
};