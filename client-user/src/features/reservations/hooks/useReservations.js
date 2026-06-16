// client-user/src/features/reservations/hooks/useReservations.js
import { useCallback, useState } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient';

/**
 * Hook de reservaciones del usuario autenticado.
 *
 * Nota: el contrato público del hook usa { restaurant_id, guest_count,
 * reservation_date, special_requests }; internamente se mapea a los campos
 * reales del backend: { restaurant_id, date, time, people_count, notes }.
 */
export function useReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** GET /reservations/my-reservations — historial con estado normalizado. */
  const fetchMyReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get('/reservations/my-reservations');
      const data = response.data.data || response.data;
      const list = (Array.isArray(data) ? data : []).map((reservation) => ({
        ...reservation,
        normalizedStatus: (reservation.status || '').toUpperCase(),
      }));
      setReservations(list);
      return list;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar tus reservaciones');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * POST /reservations — crea una reservación.
   * Recibe { restaurant_id, guest_count, reservation_date (ISO), special_requests }.
   */
  const createReservation = useCallback(
    async ({ restaurant_id, guest_count, reservation_date, special_requests }) => {
      setLoading(true);
      setError(null);
      try {
        const [date, timeRaw] = String(reservation_date).split('T');
        const payload = {
          restaurant_id,
          date,
          time: (timeRaw || '').slice(0, 5),
          people_count: Number(guest_count),
          type: 'table',
          notes: special_requests || null,
        };
        const response = await restaurantClient.post('/reservations', payload);
        const data = response.data.data || response.data;
        return { success: true, data };
      } catch (err) {
        const message =
          err.response?.data?.message || 'No se pudo crear la reservación';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /** PUT /reservations/:id — edita fecha/hora/personas/notas. */
  const updateReservation = useCallback(async (id, { date, time, people_count, notes }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.put(`/reservations/${id}`, {
        date,
        time,
        people_count: Number(people_count),
        notes,
      });
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (err) {
      const message =
        err.response?.data?.message || 'No se pudo actualizar la reservación';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /** PATCH /reservations/:id/cancel — cancela la reservación. */
  const cancelReservation = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.patch(`/reservations/${id}/cancel`);
      const data = response.data.data || response.data;
      return { success: true, data };
    } catch (err) {
      const message =
        err.response?.data?.message || 'No se pudo cancelar la reservación';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchMyReservations,
    createReservation,
    updateReservation,
    cancelReservation,
  };
}
