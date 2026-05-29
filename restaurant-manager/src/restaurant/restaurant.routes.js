import { Router } from 'express';
import multer from 'multer';
import {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  assignManager,
  deleteRestaurant,
} from './restaurant.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /brasa33/v1/restaurants:
 *   post:
 *     summary: Crear nuevo restaurante
 *     description: Crea un nuevo restaurante en el sistema. Requiere autenticación JWT.
 *     tags:
 *       - Restaurantes
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: Brasa 33 Sucursal Centro
 *               address:
 *                 type: string
 *                 example: Calle Principal 123, Centro
 *               phone:
 *                 type: string
 *                 example: +57 1 500 0000
 *               email:
 *                 type: string
 *                 example: sucursal@brasa33.com
 *               description:
 *                 type: string
 *                 example: Sucursal principal del centro
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Restaurante creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado - Token JWT requerido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validateJwt, authorizeRole('admin'), upload.single('logo'), createRestaurant);

/**
 * @swagger
 * /brasa33/v1/restaurants:
 *   get:
 *     summary: Obtener todos los restaurantes
 *     description: Retorna una lista de todos los restaurantes registrados. Sin autenticación requerida.
 *     tags:
 *       - Restaurantes
 *     responses:
 *       200:
 *         description: Lista de restaurantes obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Restaurant'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getRestaurants);

/**
 * @swagger
 * /brasa33/v1/restaurants/{id}:
 *   get:
 *     summary: Obtener restaurante por ID
 *     description: Obtiene los detalles completos de un restaurante específico.
 *     tags:
 *       - Restaurantes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante
 *         example: 1
 *     responses:
 *       200:
 *         description: Restaurante obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/assign-manager', validateJwt, authorizeRole('admin'), assignManager);

router.get('/:id', getRestaurantById);

/**
 * @swagger
 * /brasa33/v1/restaurants/{id}:
 *   put:
 *     summary: Actualizar restaurante
 *     description: Actualiza la información de un restaurante existente. Requiere autenticación JWT.
 *     tags:
 *       - Restaurantes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Brasa 33 Centro (Actualizado)
 *               address:
 *                 type: string
 *                 example: Calle Principal 456, Centro
 *               phone:
 *                 type: string
 *                 example: +57 1 600 0000
 *               email:
 *                 type: string
 *                 example: actualizado@brasa33.com
 *               description:
 *                 type: string
 *                 example: Descripción actualizada
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Restaurante actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', validateJwt, authorizeRole('admin'), upload.single('logo'), updateRestaurant);

/**
 * @swagger
 * /brasa33/v1/restaurants/{id}:
 *   delete:
 *     summary: Eliminar restaurante
 *     description: Elimina un restaurante del sistema. Requiere autenticación JWT.
 *     tags:
 *       - Restaurantes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Restaurante eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Restaurant deleted successfully
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', validateJwt, authorizeRole('admin'), deleteRestaurant);

export default router;