import { Router } from 'express';
import {
  createPromotion,
  getPublicPromotions,
  getAllPromotions,
  getPromotionById,
  getPromotionsByRestaurant,
  updatePromotion,
  approvePromotion,
  rejectPromotion,
  deletePromotion,
} from './promotion.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();

/**
 * @swagger
 * /brasa33/v1/promotions:
 *   post:
 *     summary: Crear promoción
 *     description: El gerente crea una promoción para su restaurante (queda en estado "pending" hasta aprobación del admin).
 *     tags:
 *       - Promociones
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - title
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: 2x1 en parrillas los viernes
 *               description:
 *                 type: string
 *               discount_percent:
 *                 type: number
 *                 example: 50
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-01
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-30
 *     responses:
 *       201:
 *         description: Promoción creada en estado pendiente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Rol insuficiente
 */
router.post('/', validateJwt, authorizeRole('admin', 'manager'), createPromotion);

/**
 * @swagger
 * /brasa33/v1/promotions:
 *   get:
 *     summary: Obtener promociones activas (público)
 *     description: Retorna solo las promociones con estado "active". Sin autenticación.
 *     tags:
 *       - Promociones
 *     responses:
 *       200:
 *         description: Lista de promociones activas
 */
router.get('/', getPublicPromotions);

/**
 * @swagger
 * /brasa33/v1/promotions/all:
 *   get:
 *     summary: Obtener todas las promociones (admin)
 *     description: Retorna todas las promociones en cualquier estado. Solo administradores.
 *     tags:
 *       - Promociones
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de promociones
 *       403:
 *         description: Rol insuficiente
 */
router.get('/all', validateJwt, authorizeRole('admin'), getAllPromotions);

/**
 * @swagger
 * /brasa33/v1/promotions/restaurant/{restaurantId}:
 *   get:
 *     summary: Promociones de un restaurante
 *     description: Retorna todas las promociones de un restaurante (admin/manager).
 *     tags:
 *       - Promociones
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
 *         description: Promociones del restaurante
 *       404:
 *         description: Restaurante no encontrado
 */
router.get('/restaurant/:restaurantId', validateJwt, authorizeRole('admin', 'manager'), getPromotionsByRestaurant);

/**
 * @swagger
 * /brasa33/v1/promotions/{id}:
 *   get:
 *     summary: Obtener promoción por ID
 *     tags:
 *       - Promociones
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de la promoción
 *       404:
 *         description: Promoción no encontrada
 */
router.get('/:id', getPromotionById);

/**
 * @swagger
 * /brasa33/v1/promotions/{id}:
 *   put:
 *     summary: Editar promoción
 *     description: El gerente puede editar promociones pendientes. El admin puede editar cualquiera.
 *     tags:
 *       - Promociones
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               discount_percent:
 *                 type: number
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Promoción actualizada
 *       403:
 *         description: Sin permiso para editar esta promoción
 *       404:
 *         description: Promoción no encontrada
 */
router.put('/:id', validateJwt, authorizeRole('admin', 'manager'), updatePromotion);

/**
 * @swagger
 * /brasa33/v1/promotions/{id}/approve:
 *   patch:
 *     summary: Aprobar promoción
 *     description: El administrador aprueba una promoción pendiente.
 *     tags:
 *       - Promociones
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promoción aprobada
 *       400:
 *         description: La promoción no está en estado pendiente
 *       403:
 *         description: Rol insuficiente
 */
router.patch('/:id/approve', validateJwt, authorizeRole('admin'), approvePromotion);

/**
 * @swagger
 * /brasa33/v1/promotions/{id}/reject:
 *   patch:
 *     summary: Rechazar promoción
 *     description: El administrador rechaza una promoción.
 *     tags:
 *       - Promociones
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promoción rechazada
 *       403:
 *         description: Rol insuficiente
 */
router.patch('/:id/reject', validateJwt, authorizeRole('admin'), rejectPromotion);

/**
 * @swagger
 * /brasa33/v1/promotions/{id}:
 *   delete:
 *     summary: Eliminar promoción
 *     description: Solo administradores pueden eliminar promociones.
 *     tags:
 *       - Promociones
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promoción eliminada
 *       403:
 *         description: Rol insuficiente
 *       404:
 *         description: Promoción no encontrada
 */
router.delete('/:id', validateJwt, authorizeRole('admin'), deletePromotion);

export default router;
