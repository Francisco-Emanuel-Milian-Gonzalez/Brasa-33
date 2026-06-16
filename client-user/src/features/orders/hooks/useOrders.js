// client-user/src/features/orders/hooks/useOrders.js
import { useCallback, useState } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient';

/**
 * Hook de órdenes del usuario autenticado.
 */
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** GET /orders/my-orders — historial con estado normalizado. */
  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get('/orders/my-orders');
      const data = response.data.data || response.data;
      const list = (Array.isArray(data) ? data : []).map((order) => ({
        ...order,
        normalizedStatus: (order.status || '').toUpperCase(),
      }));
      setOrders(list);
      return list;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar tus órdenes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /** GET /orders/:id — detalle de la orden con sus items. */
  const fetchOrderById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/orders/${id}`);
      const data = response.data.data || response.data;
      return { ...data, normalizedStatus: (data.status || '').toUpperCase() };
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la orden');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** POST /orders — crea una orden con items y restaurant_id del restaurante. */
  const createOrder = useCallback(async (items, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        items: items.map(({ menu_id, quantity, price }) => ({
          menu_id,
          quantity,
          price,
        })),
      };
      if (options.restaurant_id != null) {
        payload.restaurant_id = Number(options.restaurant_id);
      }
      const response = await restaurantClient.post('/orders', payload);
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo crear la orden';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /** PATCH /orders/:id/cancel — cancela la orden y restaura stock. */
  const cancelOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.patch(`/orders/${id}/cancel`);
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo cancelar la orden';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchMyOrders,
    fetchOrderById,
    createOrder,
    cancelOrder,
  };
}
