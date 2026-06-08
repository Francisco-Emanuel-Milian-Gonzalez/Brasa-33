import { Router } from 'express';
import {
  getGlobalStats,
  getRestaurantPerformance,
  getAllRestaurantsAdmin,
  toggleRestaurantActive,
  getPendingPromotions,
} from './admin.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();

const adminOnly = [validateJwt, authorizeRole('admin')];

/**
 * @swagger
 * /brasa33/v1/admin/stats:
 *   get:
 *     summary: Panel estadístico global
 *     description: |
 *       Retorna métricas globales de la plataforma:
 *       - Totales de restaurantes, pedidos, ingresos, reservas y reseñas
 *       - Top 10 restaurantes por ingresos
 *       - Distribución de pedidos por estado
 *       - Ingresos por restaurante
 *       - Ingresos de los últimos 30 días
 *       - Estado de promociones
 *     tags:
 *       - Administración
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas globales de la plataforma
 *       403:
 *         description: Rol insuficiente
 */
router.get('/stats', ...adminOnly, getGlobalStats);

/**
 * @swagger
 * /brasa33/v1/admin/restaurants:
 *   get:
 *     summary: Lista enriquecida de restaurantes
 *     description: Retorna todos los restaurantes con métricas de platos, mesas, pedidos y calificación promedio.
 *     tags:
 *       - Administración
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de restaurantes con estadísticas
 *       403:
 *         description: Rol insuficiente
 */
router.get('/restaurants', ...adminOnly, getAllRestaurantsAdmin);

/**
 * @swagger
 * /brasa33/v1/admin/restaurants/{restaurantId}/performance:
 *   get:
 *     summary: Desempeño detallado de un restaurante
 *     description: Pedidos, ingresos, reservas, calificaciones y platos más vendidos del restaurante.
 *     tags:
 *       - Administración
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Métricas de desempeño del restaurante
 *       403:
 *         description: Rol insuficiente
 *       404:
 *         description: Restaurante no encontrado
 */
router.get('/restaurants/:restaurantId/performance', ...adminOnly, getRestaurantPerformance);

/**
 * @swagger
 * /brasa33/v1/admin/restaurants/{restaurantId}/toggle-active:
 *   patch:
 *     summary: Activar / desactivar restaurante
 *     description: El administrador puede habilitar o deshabilitar un restaurante en la plataforma.
 *     tags:
 *       - Administración
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Estado del restaurante actualizado
 *       400:
 *         description: Valor inválido para is_active
 *       403:
 *         description: Rol insuficiente
 *       404:
 *         description: Restaurante no encontrado
 */
router.patch('/restaurants/:restaurantId/toggle-active', ...adminOnly, toggleRestaurantActive);

/**
 * @swagger
 * /brasa33/v1/admin/promotions/pending:
 *   get:
 *     summary: Promociones pendientes de aprobación
 *     description: Lista todas las promociones en estado "pending" para revisión del administrador.
 *     tags:
 *       - Administración
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Promociones pendientes
 *       403:
 *         description: Rol insuficiente
 */
router.get('/promotions/pending', ...adminOnly, getPendingPromotions);

export default router;