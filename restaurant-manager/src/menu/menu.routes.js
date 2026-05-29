import { Router } from 'express';
import multer from 'multer';
import {
  createDish,
  getDishes,
  getDishById,
  getDishesByRestaurant,
  updateDish,
  updateDishStock,
  deleteDish,
} from './menu.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /brasa33/v1/menu:
 *   post:
 *     summary: Crear nuevo plato
 *     description: Agrega un nuevo plato al catálogo del menú. Requiere autenticación JWT.
 *     tags:
 *       - Menú
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - restaurant_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Brasas a la Parrilla
 *               description:
 *                 type: string
 *                 example: Carnes premium asadas a fuego lento
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 45.99
 *               stock:
 *                 type: integer
 *                 example: 50
 *               restaurant_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Plato creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validateJwt, authorizeRole('admin', 'manager'), upload.single('image'), createDish);

/**
 * @swagger
 * /brasa33/v1/menu:
 *   get:
 *     summary: Obtener todos los platos
 *     description: Retorna una lista completa de todos los platos disponibles en el menú.
 *     tags:
 *       - Menú
 *     responses:
 *       200:
 *         description: Lista de platos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Dish'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getDishes);

/**
 * @swagger
 * /brasa33/v1/menu/restaurant/{restaurantId}:
 *   get:
 *     summary: Obtener platos por restaurante
 *     description: Retorna todos los platos disponibles en un restaurante específico.
 *     tags:
 *       - Menú
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante
 *         example: 1
 *     responses:
 *       200:
 *         description: Platos del restaurante obtenidos exitosamente
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
 *                     $ref: '#/components/schemas/Dish'
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/restaurant/:restaurantId', getDishesByRestaurant);

/**
 * @swagger
 * /brasa33/v1/menu/{id}:
 *   get:
 *     summary: Obtener plato por ID
 *     description: Obtiene los detalles completos de un plato específico del menú.
 *     tags:
 *       - Menú
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del plato
 *         example: 1
 *     responses:
 *       200:
 *         description: Plato obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       404:
 *         description: Plato no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getDishById);

/**
 * @swagger
 * /brasa33/v1/menu/{id}:
 *   put:
 *     summary: Actualizar plato
 *     description: Actualiza la información de un plato del menú. Requiere autenticación JWT.
 *     tags:
 *       - Menú
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del plato a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Brasas Premium a la Parrilla
 *               description:
 *                 type: string
 *                 example: Carnes premium de primera calidad asadas a fuego lento
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 52.99
 *               stock:
 *                 type: integer
 *                 example: 75
 *     responses:
 *       200:
 *         description: Plato actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       400:
 *         description: Datos inválidos o sin campos para actualizar
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Plato no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', validateJwt, authorizeRole('admin', 'manager'), upload.single('image'), updateDish);

/**
 * @swagger
 * /brasa33/v1/menu/{id}/stock:
 *   patch:
 *     summary: Actualizar stock de plato
 *     description: Actualiza el stock/inventario de un plato específico. Requiere autenticación JWT.
 *     tags:
 *       - Menú
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del plato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock
 *             properties:
 *               stock:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Plato no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/stock', validateJwt, authorizeRole('admin', 'manager'), updateDishStock);

/**
 * @swagger
 * /brasa33/v1/menu/{id}:
 *   delete:
 *     summary: Eliminar plato
 *     description: Elimina un plato del menú. Requiere autenticación JWT.
 *     tags:
 *       - Menú
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del plato a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Plato eliminado exitosamente
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
 *                   example: Dish deleted successfully
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Plato no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', validateJwt, authorizeRole('admin', 'manager'), deleteDish);

export default router;
