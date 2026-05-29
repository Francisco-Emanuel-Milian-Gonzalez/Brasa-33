import { pool } from '../config/db.js';

const isManagerRole = (role) =>
  role === 'MANAGER_ROLE' || role === 'manager' || role === 'MANAGER';

const isAdminRole = (role) =>
  role === 'ADMIN_ROLE' || role === 'admin' || role === 'ADMIN';

export const getManagerRestaurantId = async (userId) => {
  const { rows } = await pool.query(
    'SELECT id FROM restaurants WHERE manager_id = $1 LIMIT 1',
    [userId],
  );
  return rows[0]?.id ?? null;
};

export const getManagerRestaurant = async (userId) => {
  const { rows } = await pool.query(
    `SELECT id, name, address, phone, email, description, logo_url, is_active, manager_id, created_at
     FROM restaurants WHERE manager_id = $1 LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
};

export const requireManagerRestaurantId = async (userId) => {
  const restaurantId = await getManagerRestaurantId(userId);
  if (!restaurantId) {
    const error = new Error('No tienes un restaurante asignado');
    error.status = 403;
    throw error;
  }
  return restaurantId;
};

/** Para managers: ignora body; para admin: exige restaurant_id en body/params. */
export const resolveRestaurantIdForUser = async (user, explicitRestaurantId) => {
  if (isManagerRole(user.role)) {
    return requireManagerRestaurantId(user.id);
  }
  if (explicitRestaurantId) {
    return Number(explicitRestaurantId);
  }
  const error = new Error('restaurant_id es obligatorio');
  error.status = 400;
  throw error;
};

export const assertManagerOwnsRestaurant = async (userId, resourceRestaurantId) => {
  const managerRestaurantId = await requireManagerRestaurantId(userId);
  if (Number(resourceRestaurantId) !== Number(managerRestaurantId)) {
    const error = new Error('No tienes permiso sobre este recurso');
    error.status = 403;
    throw error;
  }
  return managerRestaurantId;
};

export const assertManagerCanAccess = async (user, resourceRestaurantId) => {
  if (isManagerRole(user.role)) {
    await assertManagerOwnsRestaurant(user.id, resourceRestaurantId);
  }
};

export { isManagerRole, isAdminRole };
