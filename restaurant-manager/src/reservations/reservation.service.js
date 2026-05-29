import {
  createReservation as createReservationModel,
  getAllReservations,
  getReservationsByRestaurant as getReservationsByRestaurantModel,
  getReservationById as getReservationByIdModel,
  getReservationsByUserId,
  updateReservation as updateReservationModel,
  updateReservationStatus,
  getRestaurantById,
} from './reservation.model.js';
import { createNotification, notifyRestaurantManager } from '../utils/notifications.js';

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const VALID_TYPES = ['table', 'delivery', 'takeaway'];

const validateReservationPayload = (date, time, peopleCount) => {
  if (!date || !time || peopleCount === undefined) {
    const error = new Error('Los campos date, time y people_count son obligatorios');
    error.status = 400;
    throw error;
  }

  // Validar que la fecha no sea pasada
  const reservationDateTime = new Date(`${date}T${time}`);
  const now = new Date();

  if (reservationDateTime < now) {
    const error = new Error('La fecha y hora de la reservación no pueden ser pasadas');
    error.status = 400;
    throw error;
  }

  if (typeof peopleCount !== 'number' || peopleCount <= 0) {
    const error = new Error('people_count debe ser un número mayor a 0');
    error.status = 400;
    throw error;
  }
};

export const createReservation = async (userId, restaurantId, date, time, peopleCount, type = 'table', notes = null) => {
  if (!restaurantId) {
    const error = new Error('restaurant_id es obligatorio');
    error.status = 400;
    throw error;
  }

  validateReservationPayload(date, time, peopleCount);

  if (type && !VALID_TYPES.includes(type)) {
    const error = new Error(`Tipo inválido. Valores permitidos: ${VALID_TYPES.join(', ')}`);
    error.status = 400;
    throw error;
  }

  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }

  const reservation = await createReservationModel(userId, restaurantId, date, time, peopleCount, type, notes);

  await notifyRestaurantManager(restaurantId, {
    title: 'Nueva reservación en tu restaurante',
    message: `Reservación para ${peopleCount} personas el ${date} a las ${time}`,
    type: 'reservation',
  });

  await createNotification({
    userId,
    title: 'Reservación registrada',
    message: `Tu reservación en ${restaurant.name} está pendiente de confirmación.`,
    type: 'reservation',
  });

  return reservation;
};

export const getReservations = async () => {
  return await getAllReservations();
};

export const getReservationsByRestaurant = async (restaurantId) => {
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }
  return await getReservationsByRestaurantModel(restaurantId);
};

export const updateReservation = async (id, payload, userId, userRole) => {
  const reservation = await getReservationByIdModel(id);
  if (!reservation) {
    const error = new Error('Reservación no encontrada');
    error.status = 404;
    throw error;
  }

  if (userRole === 'client' && reservation.user_id !== userId) {
    const error = new Error('No tienes permiso para modificar esta reservación');
    error.status = 403;
    throw error;
  }

  if (['cancelled', 'completed'].includes(reservation.status)) {
    const error = new Error(`No se puede modificar una reservación ${reservation.status}`);
    error.status = 400;
    throw error;
  }

  const { date, time, people_count, type, notes } = payload;

  if (date || time) {
    const newDate = date || reservation.date;
    const newTime = time || reservation.time;
    const reservationDateTime = new Date(`${newDate}T${newTime}`);
    if (reservationDateTime < new Date()) {
      const error = new Error('La nueva fecha/hora no puede ser pasada');
      error.status = 400;
      throw error;
    }
  }

  if (type && !VALID_TYPES.includes(type)) {
    const error = new Error(`Tipo inválido. Valores permitidos: ${VALID_TYPES.join(', ')}`);
    error.status = 400;
    throw error;
  }

  if (people_count !== undefined && (isNaN(Number(people_count)) || Number(people_count) <= 0)) {
    const error = new Error('people_count debe ser un número mayor a 0');
    error.status = 400;
    throw error;
  }

  const updated = await updateReservationModel(id, { date, time, people_count, type, notes });
  if (!updated) {
    const error = new Error('No se proporcionaron campos para actualizar');
    error.status = 400;
    throw error;
  }
  return updated;
};

export const getMyReservations = async (userId) => {
  return await getReservationsByUserId(userId);
};

export const getReservationById = async (id) => {
  const reservation = await getReservationByIdModel(id);

  if (!reservation) {
    const error = new Error('Reservación no encontrada');
    error.status = 404;
    throw error;
  }

  return reservation;
};

export const cancelReservation = async (id, userId = null, userRole = null) => {
  const reservation = await getReservationByIdModel(id);

  if (!reservation) {
    const error = new Error('Reservación no encontrada');
    error.status = 404;
    throw error;
  }

  if (userRole === 'client' && reservation.user_id !== userId) {
    const error = new Error('No tienes permiso para cancelar esta reservación');
    error.status = 403;
    throw error;
  }

  if (reservation.status === 'completed') {
    const error = new Error('No se puede cancelar una reservación completada');
    error.status = 400;
    throw error;
  }

  if (reservation.status === 'cancelled') {
    const error = new Error('La reservación ya está cancelada');
    error.status = 400;
    throw error;
  }

  await updateReservationStatus(id, 'cancelled');
  return await getReservationByIdModel(id);
};

export const confirmReservation = async (id) => {
  const reservation = await getReservationByIdModel(id);

  if (!reservation) {
    const error = new Error('Reservación no encontrada');
    error.status = 404;
    throw error;
  }

  if (reservation.status !== 'pending') {
    const error = new Error('Solo se pueden confirmar reservaciones pendientes');
    error.status = 400;
    throw error;
  }

  await updateReservationStatus(id, 'confirmed');

  await createNotification({
    userId: reservation.user_id,
    title: 'Tu reservación fue confirmada',
    message: `Tu reservación #${id} ha sido confirmada por el restaurante.`,
    type: 'reservation',
  });

  return await getReservationByIdModel(id);
};

export const completeReservation = async (id) => {
  const reservation = await getReservationByIdModel(id);

  if (!reservation) {
    const error = new Error('Reservación no encontrada');
    error.status = 404;
    throw error;
  }

  if (reservation.status === 'cancelled') {
    const error = new Error('No se puede completar una reservación cancelada');
    error.status = 400;
    throw error;
  }

  if (reservation.status === 'completed') {
    const error = new Error('La reservación ya está completada');
    error.status = 400;
    throw error;
  }

  await updateReservationStatus(id, 'completed');
  return await getReservationByIdModel(id);
};
