export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

export type Booking = {
  id: string;
  rideId: string;
  userId: string;
  status: BookingStatus;
  createdAt: string;
};
