import { Router } from 'express';
import {
  getTotalRevenue,
  getSalesByDate,
  getTopProducts,
  getOrdersByStatus,
  getReservationsReport,
  getTopCustomers,
} from './report.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();

const adminOrManager = [validateJwt, authorizeRole('admin', 'manager')];

/**
 * @swagger
 * /brasa33/v1/reports/total-revenue:
 *   get:
 *     summary: Obtener ingresos totales
 *     description: Retorna el ingreso total generado por todas las órdenes completadas.
 *     tags:
 *       - Reportes
 *     responses:
 *       200:
 *         description: Ingresos totales obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_revenue:
 *                       type: number
 *                       format: decimal
 *                       example: 5250.75
 *                     currency:
 *                       type: string
 *                       example: COP
 *       500:
 *         description: Error interno del servidor
 */
router.get('/total-revenue', ...adminOrManager, getTotalRevenue);

/**
 * @swagger
 * /brasa33/v1/reports/sales-by-date:
 *   get:
 *     summary: Obtener ventas por fecha
 *     description: Retorna un resumen de ventas agrupadas por fecha.
 *     tags:
 *       - Reportes
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial para el reporte (YYYY-MM-DD)
 *         example: 2024-01-01
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final para el reporte (YYYY-MM-DD)
 *         example: 2024-02-29
 *     responses:
 *       200:
 *         description: Ventas por fecha obtenidas exitosamente
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
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: 2024-01-15
 *                       total_sales:
 *                         type: number
 *                         format: decimal
 *                         example: 450.00
 *                       order_count:
 *                         type: integer
 *                         example: 12
 *       500:
 *         description: Error interno del servidor
 */
router.get('/sales-by-date', ...adminOrManager, getSalesByDate);

/**
 * @swagger
 * /brasa33/v1/reports/top-products:
 *   get:
 *     summary: Obtener productos más vendidos
 *     description: Retorna una lista de los platos más populares ordenados por cantidad vendida.
 *     tags:
 *       - Reportes
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad máxima de productos a retornar
 *         example: 10
 *     responses:
 *       200:
 *         description: Productos más vendidos obtenidos exitosamente
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
 *                     type: object
 *                     properties:
 *                       menu_id:
 *                         type: integer
 *                         example: 1
 *                       dish_name:
 *                         type: string
 *                         example: Brasas a la Parrilla
 *                       total_quantity_sold:
 *                         type: integer
 *                         example: 156
 *                       total_revenue:
 *                         type: number
 *                         format: decimal
 *                         example: 7174.44
 *       500:
 *         description: Error interno del servidor
 */
router.get('/top-products', ...adminOrManager, getTopProducts);

/**
 * @swagger
 * /brasa33/v1/reports/orders-by-status:
 *   get:
 *     summary: Obtener órdenes por estado
 *     description: Retorna un conteo de órdenes agrupadas por su estado actual.
 *     tags:
 *       - Reportes
 *     responses:
 *       200:
 *         description: Órdenes por estado obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: integer
 *                       example: 5
 *                     confirmed:
 *                       type: integer
 *                       example: 8
 *                     preparing:
 *                       type: integer
 *                       example: 3
 *                     ready:
 *                       type: integer
 *                       example: 2
 *                     completed:
 *                       type: integer
 *                       example: 89
 *                     cancelled:
 *                       type: integer
 *                       example: 1
 *       500:
 *         description: Error interno del servidor
 */
router.get('/orders-by-status', ...adminOrManager, getOrdersByStatus);

/**
 * @swagger
 * /brasa33/v1/reports/reservations-report:
 *   get:
 *     summary: Obtener reporte de reservaciones
 *     description: Retorna un resumen de reservaciones con detalles de estado y ocupación.
 *     tags:
 *       - Reportes
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial (YYYY-MM-DD)
 *         example: 2024-01-01
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final (YYYY-MM-DD)
 *         example: 2024-02-29
 *     responses:
 *       200:
 *         description: Reporte de reservaciones obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_reservations:
 *                       type: integer
 *                       example: 45
 *                     confirmed:
 *                       type: integer
 *                       example: 38
 *                     cancelled:
 *                       type: integer
 *                       example: 5
 *                     completed:
 *                       type: integer
 *                       example: 35
 *                     pending:
 *                       type: integer
 *                       example: 2
 *                     average_guest_count:
 *                       type: number
 *                       format: decimal
 *                       example: 4.2
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reservations-report', ...adminOrManager, getReservationsReport);
router.get('/manager/top-customers', ...adminOrManager, getTopCustomers);

export default router;
