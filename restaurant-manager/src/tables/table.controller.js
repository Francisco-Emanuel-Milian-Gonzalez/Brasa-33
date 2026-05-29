import {
  createTable as createTableService,
  getTablesByRestaurant as getTablesByRestaurantService,
  getTableById as getTableByIdService,
  updateTable as updateTableService,
  updateTableStatus as updateTableStatusService,
  deleteTable as deleteTableService,
} from './table.service.js';
import { requireManagerRestaurantId, isManagerRole } from '../utils/managerRestaurant.js';

export const createTable = async (req, res, next) => {
  try {
    const table = await createTableService(req.user, req.body);
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

export const getTablesByRestaurant = async (req, res, next) => {
  try {
    let { restaurantId } = req.params;
    if (isManagerRole(req.user?.role)) {
      restaurantId = await requireManagerRestaurantId(req.user.id);
    }
    const tables = await getTablesByRestaurantService(restaurantId, req.user);
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

export const getTableById = async (req, res, next) => {
  try {
    const table = await getTableByIdService(req.params.id);
    res.status(200).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req, res, next) => {
  try {
    const table = await updateTableService(req.params.id, req.user, req.body);
    res.status(200).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

export const updateTableStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const table = await updateTableStatusService(req.params.id, status, req.user);
    res.status(200).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    await deleteTableService(req.params.id, req.user);
    res.status(200).json({ success: true, message: 'Mesa eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};
