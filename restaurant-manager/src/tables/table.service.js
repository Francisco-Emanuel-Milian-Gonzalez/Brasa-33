import {
  createTable as createTableModel,
  getTablesByRestaurant as getTablesByRestaurantModel,
  getTableById as getTableByIdModel,
  updateTable as updateTableModel,
  updateTableStatus as updateTableStatusModel,
  deleteTable as deleteTableModel,
  tableNumberExistsInRestaurant,
} from './table.model.js';
import { pool } from '../config/db.js';
import {
  resolveRestaurantIdForUser,
  assertManagerCanAccess,
  isManagerRole,
  requireManagerRestaurantId,
} from '../utils/managerRestaurant.js';

const VALID_STATUSES = ['available', 'occupied', 'reserved', 'maintenance'];

const getRestaurantById = async (id) => {
  const { rows } = await pool.query('SELECT id FROM restaurants WHERE id = $1', [id]);
  return rows[0];
};

const validateTablePayload = ({ number, capacity }) => {
  if (!number || !capacity) {
    const error = new Error('Los campos number y capacity son obligatorios');
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(Number(number)) || Number(number) <= 0) {
    const error = new Error('El número de mesa debe ser un entero positivo');
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
    const error = new Error('La capacidad debe ser un entero positivo');
    error.status = 400;
    throw error;
  }
};

export const createTable = async (user, payload) => {
  validateTablePayload(payload);

  const restaurant_id = await resolveRestaurantIdForUser(user, payload.restaurant_id);

  const restaurant = await getRestaurantById(restaurant_id);
  if (!restaurant) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }

  const duplicate = await tableNumberExistsInRestaurant(restaurant_id, payload.number);
  if (duplicate) {
    const error = new Error(`Ya existe una mesa número ${payload.number} en este restaurante`);
    error.status = 409;
    throw error;
  }

  return createTableModel({
    restaurant_id,
    number: Number(payload.number),
    capacity: Number(payload.capacity),
    location: payload.location,
  });
};

export const getTablesByRestaurant = async (restaurantId, user) => {
  if (user && isManagerRole(user.role)) {
    const managerRestaurantId = await requireManagerRestaurantId(user.id);
    if (Number(restaurantId) !== Number(managerRestaurantId)) {
      const error = new Error('No tienes permiso sobre este restaurante');
      error.status = 403;
      throw error;
    }
  }

  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }
  return getTablesByRestaurantModel(restaurantId);
};

export const getTableById = async (id) => {
  const table = await getTableByIdModel(id);
  if (!table) {
    const error = new Error('Mesa no encontrada');
    error.status = 404;
    throw error;
  }
  return table;
};

export const updateTable = async (id, user, payload) => {
  const table = await getTableByIdModel(id);
  if (!table) {
    const error = new Error('Mesa no encontrada');
    error.status = 404;
    throw error;
  }

  if (user && isManagerRole(user.role)) {
    await assertManagerCanAccess(user, table.restaurant_id);
  }

  const { number, capacity, location, status } = payload;

  if (status && !VALID_STATUSES.includes(status)) {
    const error = new Error(`Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`);
    error.status = 400;
    throw error;
  }

  if (number !== undefined) {
    if (!Number.isInteger(Number(number)) || Number(number) <= 0) {
      const error = new Error('El número de mesa debe ser un entero positivo');
      error.status = 400;
      throw error;
    }
    const duplicate = await tableNumberExistsInRestaurant(table.restaurant_id, number, id);
    if (duplicate) {
      const error = new Error(`Ya existe una mesa número ${number} en este restaurante`);
      error.status = 409;
      throw error;
    }
  }

  if (capacity !== undefined && (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0)) {
    const error = new Error('La capacidad debe ser un entero positivo');
    error.status = 400;
    throw error;
  }

  const updated = await updateTableModel(id, { number, capacity, location, status });
  if (!updated) {
    const error = new Error('No se proporcionaron campos para actualizar');
    error.status = 400;
    throw error;
  }
  return updated;
};

export const updateTableStatus = async (id, status, user) => {
  if (!status || !VALID_STATUSES.includes(status)) {
    const error = new Error(`Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`);
    error.status = 400;
    throw error;
  }
  const table = await getTableByIdModel(id);
  if (!table) {
    const error = new Error('Mesa no encontrada');
    error.status = 404;
    throw error;
  }

  if (user && isManagerRole(user.role)) {
    await assertManagerCanAccess(user, table.restaurant_id);
  }

  return updateTableStatusModel(id, status);
};

export const deleteTable = async (id, user) => {
  const table = await getTableByIdModel(id);
  if (!table) {
    const error = new Error('Mesa no encontrada');
    error.status = 404;
    throw error;
  }

  if (user && isManagerRole(user.role)) {
    await assertManagerCanAccess(user, table.restaurant_id);
  }

  await deleteTableModel(id);
};
