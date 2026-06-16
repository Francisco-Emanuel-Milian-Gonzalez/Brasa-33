// client-user/src/features/promotions/hooks/usePromotions.js
import { useCallback, useState } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient';

/**
 * Hook de promociones públicas (activas).
 */
export function usePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** GET /promotions — solo promociones activas (endpoint público). */
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get('/promotions');
      const data = response.data.data || response.data;
      setPromotions(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las promociones');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET /promotions/:id + GET /restaurants/:restaurant_id —
   * detalle de la promoción con los datos del restaurante asociado.
   */
  const fetchPromotionDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const promotionRes = await restaurantClient.get(`/promotions/${id}`);
      const promotion = promotionRes.data.data || promotionRes.data;

      let restaurant = null;
      if (promotion?.restaurant_id) {
        const restaurantRes = await restaurantClient.get(
          `/restaurants/${promotion.restaurant_id}`,
        );
        restaurant = restaurantRes.data.data || restaurantRes.data;
      }

      return { promotion, restaurant };
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la promoción');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { promotions, loading, error, fetchPromotions, fetchPromotionDetail };
}
