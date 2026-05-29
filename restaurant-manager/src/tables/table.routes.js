import { Router } from 'express';
import {
  createTable,
  getTablesByRestaurant,
  getTableById,
  updateTable,
  updateTableStatus,
  deleteTable,
} from './table.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();

/**
 * @swagger
 * /brasa33/v1/tables:
 *   post:
 *     summary: Crear nueva mesa
 *     description: Crea una mesa en el restaurante asignado. Solo gerentes y administradores.
 *     tags:
 *       - Mesas
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
 *               - number
 *               - capacity
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *                 example: 1
 *               number:
 *                 type: integer
 *                 example: 5
 *               capacity:
 *                 type: integer
 *                 example: 4
 *               location:
 *                 type: string
 *                 example: Terraza
 *     responses:
 *       201:
 *         description: Mesa creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente
 *       409:
 *         description: Número de mesa duplicado
 */
router.post('/', validateJwt, authorizeRole('admin', 'manager'), createTable);

/**
 * @swagger
 * /brasa33/v1/tables/restaurant/{restaurantId}:
 *   get:
 *     summary: Obtener mesas de un restaurante
 *     description: Retorna todas las mesas de un restaurante específico.
 *     tags:
 *       - Mesas
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de mesas obtenida
 *       404:
 *         description: Restaurante no encontrado
 */
router.get('/restaurant/:restaurantId', getTablesByRestaurant);

/**
 * @swagger
 * /brasa33/v1/tables/{id}:
 *   get:
 *     summary: Obtener mesa por ID
 *     tags:
 *       - Mesas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mesa obtenida
 *       404:
 *         description: Mesa no encontrada
 */
router.get('/:id', getTableById);

/**
 * @swagger
 * /brasa33/v1/tables/{id}:
 *   put:
 *     summary: Actualizar mesa
 *     description: Actualiza datos de una mesa. Solo gerentes y administradores.
 *     tags:
 *       - Mesas
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
 *               number:
 *                 type: integer
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, maintenance]
 *     responses:
 *       200:
 *         description: Mesa actualizada
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Rol insuficiente
 *       404:
 *         description: Mesa no encontrada
 */
router.put('/:id', validateJwt, authorizeRole('admin', 'manager'), updateTable);

/**
 * @swagger
 * /brasa33/v1/tables/{id}/status:
 *   patch:
 *     summary: Cambiar estado de una mesa
 *     description: Actualiza únicamente el estado de disponibilidad de la mesa.
 *     tags:
 *       - Mesas
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, maintenance]
 *                 example: occupied
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Estado inválido
 *       403:
 *         description: Rol insuficiente
 *       404:
 *         description: Mesa no encontrada
 */
router.patch('/:id/status', validateJwt, authorizeRole('admin', 'manager'), updateTableStatus);

/**
 * @swagger
 * /brasa33/v1/tables/{id}:
 *   delete:
 *     summary: Eliminar mesa
 *     description: Elimina una mesa del sistema. Solo administradores.
 *     tags:
 *       - Mesas
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
 *         description: Mesa eliminada
 *       403:
 *         description: Rol insuficiente
 *       404:
 *         description: Mesa no encontrada
 */
router.delete('/:id', validateJwt, authorizeRole('admin', 'manager'), deleteTable);

export default router;
