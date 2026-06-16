// client-user/src/features/reviews/hooks/useReviews.js
import { useCallback, useState } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient';

/**
 * Hook de reseñas contra restaurant-manager (/reviews).
 */
export function useReviews() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** GET /reviews/my-reviews */
  const getMyReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get('/reviews/my-reviews');
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar tus reseñas');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /** POST /reviews { restaurant_id, menu_id, rating, comment } */
  const createReview = useCallback(async ({ restaurant_id, menu_id, rating, comment }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.post('/reviews', {
        restaurant_id: restaurant_id || null,
        menu_id: menu_id || null,
        rating: Number(rating),
        comment: comment?.trim() || null,
      });
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo publicar la reseña';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /** PUT /reviews/:id */
  const updateReview = useCallback(async (id, { rating, comment }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.put(`/reviews/${id}`, {
        rating: Number(rating),
        comment: comment?.trim() || null,
      });
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo actualizar la reseña';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /** DELETE /reviews/:id */
  const deleteReview = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await restaurantClient.delete(`/reviews/${id}`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo eliminar la reseña';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, getMyReviews, createReview, updateReview, deleteReview };
}
