import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrdersByRestaurant,
  getMyOrders,
  getOrderById,
  confirmOrder,
  updateOrderStatus,
  cancelOrder,
} from './order.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();

/**
 * @swagger
 * /brasa33/v1/orders:
 *   post:
 *     summary: Crear nueva orden
 *     description: Crea una nueva orden con sus items. Requiere autenticación JWT. El user_id se obtiene del token JWT.
 *     tags:
 *       - Órdenes
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menu_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     price:
 *                       type: number
 *                       format: decimal
 *                       example: 45.99
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validateJwt, createOrder);

/**
 * @swagger
 * /brasa33/v1/orders:
 *   get:
 *     summary: Obtener todas las órdenes
 *     description: Retorna una lista de todas las órdenes del sistema (admin).
 *     tags:
 *       - Órdenes
 *     responses:
 *       200:
 *         description: Lista de órdenes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', validateJwt, authorizeRole('admin'), getOrders);

/**
 * @swagger
 * /brasa33/v1/orders/my-orders:
 *   get:
 *     summary: Obtener mis órdenes
 *     description: Retorna todas las órdenes del usuario autenticado. Requiere JWT.
 *     tags:
 *       - Órdenes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Órdenes del usuario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/my-orders', validateJwt, getMyOrders);

/**
 * @swagger
 * /brasa33/v1/orders/restaurant/{restaurantId}:
 *   get:
 *     summary: Pedidos de un restaurante (gerente/admin)
 *     description: Retorna todos los pedidos asociados a un restaurante. Solo gerentes y administradores.
 *     tags:
 *       - Órdenes
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
 *         description: Lista de pedidos del restaurante
 *       403:
 *         description: Rol insuficiente
 */
router.get('/restaurant/:restaurantId', validateJwt, authorizeRole('admin', 'manager'), getOrdersByRestaurant);

/**
 * @swagger
 * /brasa33/v1/orders/{id}:
 *   get:
 *     summary: Obtener orden por ID
 *     description: Obtiene los detalles completos de una orden específica incluyendo sus items.
 *     tags:
 *       - Órdenes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden
 *         example: 101
 *     responses:
 *       200:
 *         description: Orden obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getOrderById);

/**
 * @swagger
 * /brasa33/v1/orders/{id}/confirm:
 *   patch:
 *     summary: Confirmar orden
 *     description: Cambia el estado de la orden a confirmada. Requiere autenticación JWT.
 *     tags:
 *       - Órdenes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden a confirmar
 *         example: 101
 *     responses:
 *       200:
 *         description: Orden confirmada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/confirm', validateJwt, authorizeRole('admin', 'manager'), confirmOrder);

/**
 * @swagger
 * /brasa33/v1/orders/{id}/status:
 *   patch:
 *     summary: Actualizar estado de la orden
 *     description: Cambia el estado de la orden (pending, confirmed, preparing, ready, completed, cancelled). Requiere autenticación JWT.
 *     tags:
 *       - Órdenes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden
 *         example: 101
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
 *                 example: preparing
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Status inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/status', validateJwt, authorizeRole('admin', 'manager'), updateOrderStatus);

/**
 * @swagger
 * /brasa33/v1/orders/{id}/cancel:
 *   patch:
 *     summary: Cancelar orden
 *     description: Cancela una orden y restaura el stock de los items. Requiere autenticación JWT.
 *     tags:
 *       - Órdenes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden a cancelar
 *         example: 101
 *     responses:
 *       200:
 *         description: Orden cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/cancel', validateJwt, cancelOrder);

export default router;
