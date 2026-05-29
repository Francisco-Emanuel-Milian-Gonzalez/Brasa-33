import { Router } from 'express';
import {
  createReview,
  getReviewsByRestaurant,
  getReviewsByDish,
  getMyReviews,
  updateReview,
  deleteReview,
} from './review.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';

const router = Router();

/**
 * @swagger
 * /brasa33/v1/reviews:
 *   post:
 *     summary: Crear reseña
 *     description: El cliente autenticado crea una reseña para un restaurante o plato.
 *     tags:
 *       - Reseñas
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *                 example: 1
 *               menu_id:
 *                 type: integer
 *                 example: null
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Excelente servicio y comida.
 *     responses:
 *       201:
 *         description: Reseña creada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', validateJwt, createReview);

/**
 * @swagger
 * /brasa33/v1/reviews/my-reviews:
 *   get:
 *     summary: Mis reseñas
 *     description: Retorna todas las reseñas creadas por el usuario autenticado.
 *     tags:
 *       - Reseñas
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mis reseñas
 *       401:
 *         description: No autorizado
 */
router.get('/my-reviews', validateJwt, getMyReviews);

/**
 * @swagger
 * /brasa33/v1/reviews/restaurant/{restaurantId}:
 *   get:
 *     summary: Reseñas de un restaurante
 *     description: Obtiene todas las reseñas y el promedio de calificación de un restaurante.
 *     tags:
 *       - Reseñas
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reseñas y estadísticas del restaurante
 *       404:
 *         description: Restaurante no encontrado
 */
router.get('/restaurant/:restaurantId', getReviewsByRestaurant);

/**
 * @swagger
 * /brasa33/v1/reviews/dish/{menuId}:
 *   get:
 *     summary: Reseñas de un plato
 *     description: Obtiene todas las reseñas y el promedio de calificación de un plato.
 *     tags:
 *       - Reseñas
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reseñas y estadísticas del plato
 *       404:
 *         description: Plato no encontrado
 */
router.get('/dish/:menuId', getReviewsByDish);

/**
 * @swagger
 * /brasa33/v1/reviews/{id}:
 *   put:
 *     summary: Actualizar reseña
 *     description: El autor puede editar su propia reseña. El admin puede editar cualquiera.
 *     tags:
 *       - Reseñas
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reseña actualizada
 *       403:
 *         description: Sin permiso para editar esta reseña
 *       404:
 *         description: Reseña no encontrada
 */
router.put('/:id', validateJwt, updateReview);

/**
 * @swagger
 * /brasa33/v1/reviews/{id}:
 *   delete:
 *     summary: Eliminar reseña
 *     description: El autor puede eliminar su propia reseña. El admin puede eliminar cualquiera.
 *     tags:
 *       - Reseñas
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
 *         description: Reseña eliminada
 *       403:
 *         description: Sin permiso para eliminar esta reseña
 *       404:
 *         description: Reseña no encontrada
 */
router.delete('/:id', validateJwt, deleteReview);

export default router;
