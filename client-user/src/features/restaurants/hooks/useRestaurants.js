// client-user/src/features/restaurants/hooks/useRestaurants.js
import { useCallback, useState } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient';

/**
 * Hook de restaurantes: listado, detalle con menú y reseñas de platos.
 */
export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** GET /restaurants — lista pública de restaurantes. */
  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get('/restaurants');
      const data = response.data.data || response.data;
      setRestaurants(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los restaurantes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /** GET /restaurants/:id + GET /menu/restaurant/:id — detalle y platos. */
  const fetchRestaurantDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const [restaurantRes, dishesRes] = await Promise.all([
        restaurantClient.get(`/restaurants/${id}`),
        restaurantClient.get(`/menu/restaurant/${id}`),
      ]);
      const restaurantData = restaurantRes.data.data || restaurantRes.data;
      const dishesData = dishesRes.data.data || dishesRes.data;
      setRestaurant(restaurantData);
      setDishes(Array.isArray(dishesData) ? dishesData : []);
      return { restaurant: restaurantData, dishes: dishesData };
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el restaurante');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** GET /reviews/dish/:menuId — reseñas y promedio de un plato. */
  const fetchDishReviews = useCallback(async (menuId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/reviews/dish/${menuId}`);
      const data = response.data.data || response.data;
      return {
        reviews: data.reviews || [],
        stats: data.stats || { total_reviews: 0, average_rating: null },
      };
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las reseñas');
      return { reviews: [], stats: { total_reviews: 0, average_rating: null } };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    restaurants,
    restaurant,
    dishes,
    loading,
    error,
    fetchRestaurants,
    fetchRestaurantDetail,
    fetchDishReviews,
  };
}
