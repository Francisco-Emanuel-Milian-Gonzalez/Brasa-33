import {
  createReservation as createReservationService,
  getReservations as getReservationsService,
  getReservationsByRestaurant as getReservationsByRestaurantService,
  getMyReservations as getMyReservationsService,
  getReservationById as getReservationByIdService,
  updateReservation as updateReservationService,
  cancelReservation as cancelReservationService,
  completeReservation as completeReservationService,
  confirmReservation as confirmReservationService,
} from './reservation.service.js';

export const createReservation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { restaurant_id, date, time, people_count, type, notes } = req.body;
    const reservation = await createReservationService(userId, restaurant_id, date, time, people_count, type, notes);
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

export const getReservationsByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const reservations = await getReservationsByRestaurantService(restaurantId);
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

export const updateReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await updateReservationService(id, req.body, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

export const getReservations = async (req, res, next) => {
  try {
    const reservations = await getReservationsService();
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reservations = await getMyReservationsService(userId);

    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await getReservationByIdService(id);

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await cancelReservationService(id, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

export const confirmReservation = async (req, res, next) => {
  try {
    const reservation = await confirmReservationService(req.params.id);
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

export const completeReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await completeReservationService(id);

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};
