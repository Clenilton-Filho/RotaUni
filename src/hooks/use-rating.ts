import { useEffect, useState } from 'react';

import type { Rating, RatingStars } from '@/domain/rating/rating.types';
import { rideHistoryRepository } from '@/services/history/local-ride-history.repository';
import { ratingRepository } from '@/services/rating/local-rating.repository';
import { ridesRepository } from '@/services/rides/mock-rides.repository';
import { useAppState } from '@/state/app-provider';

export function useRating(rideId: string | undefined) {
  const { currentBooking, currentUser } = useAppState();
  const [rating, setRating] = useState<Rating | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!rideId || !currentUser) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setRating(null);
        setIsLoading(false);
      });
      return () => {
        isMounted = false;
      };
    }

    ratingRepository
      .getByRideAndUser(rideId, currentUser.userId)
      .then((storedRating) => {
        if (isMounted) setRating(storedRating);
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar a avaliação.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser, rideId]);

  async function submitRating(stars: RatingStars) {
    if (!currentUser) {
      setError('Usuário não encontrado.');
      return null;
    }

    const hasActiveBooking =
      currentBooking?.rideId === rideId && currentBooking?.userId === currentUser.userId;
    const histories = await rideHistoryRepository.listByUser(currentUser.userId);
    const hasCompletedRide = histories.some((history) => history.rideId === rideId);

    if (!rideId || (!hasActiveBooking && !hasCompletedRide)) {
      setError('Não há uma reserva válida para avaliar.');
      return null;
    }

    const ride = await ridesRepository.getRideById(rideId);

    if (!ride) {
      setError('Carona não encontrada.');
      return null;
    }

    if (isSubmitting) return rating;

    setIsSubmitting(true);
    setError(null);

    try {
      const savedRating = await ratingRepository.saveRating({
        id: `${Date.now()}`,
        rideId,
        driverId: ride.driver.id,
        userId: currentUser.userId,
        stars,
        createdAt: new Date().toISOString(),
      });
      setRating(savedRating);
      return savedRating;
    } catch {
      setError('Não foi possível enviar a avaliação.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { rating, isLoading, isSubmitting, error, submitRating };
}