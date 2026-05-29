import { Router } from 'express';
import {
  generateInvoice,
  getInvoiceById,
  getInvoiceByOrder,
  getMyInvoices,
  getAllInvoices,
} from './invoice.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();

/**
 * @swagger
 * /brasa33/v1/invoices/generate/{orderId}:
 *   post:
 *     summary: Generar factura
 *     description: Genera una factura para un pedido confirmado o completado. Solo gerentes y admins.
 *     tags:
 *       - Facturas
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Factura generada con desglose de items, subtotal, IVA (19%) y total
 *       400:
 *         description: El pedido no está en estado válido para facturar
 *       403:
 *         description: Rol insuficiente
 *       404:
 *         description: Pedido no encontrado
 *       409:
 *         description: Ya existe una factura para este pedido
 */
router.post('/generate/:orderId', validateJwt, authorizeRole('admin', 'manager'), generateInvoice);

/**
 * @swagger
 * /brasa33/v1/invoices/my-invoices:
 *   get:
 *     summary: Mis facturas
 *     description: Retorna todas las facturas del usuario autenticado.
 *     tags:
 *       - Facturas
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas del usuario
 */
router.get('/my-invoices', validateJwt, getMyInvoices);

/**
 * @swagger
 * /brasa33/v1/invoices/order/{orderId}:
 *   get:
 *     summary: Factura de un pedido
 *     description: Retorna la factura asociada a un pedido específico.
 *     tags:
 *       - Facturas
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Factura del pedido
 *       403:
 *         description: Sin permiso
 *       404:
 *         description: Factura no encontrada para ese pedido
 */
router.get('/order/:orderId', validateJwt, getInvoiceByOrder);

/**
 * @swagger
 * /brasa33/v1/invoices/all:
 *   get:
 *     summary: Todas las facturas (admin)
 *     description: Retorna todas las facturas del sistema. Solo administradores.
 *     tags:
 *       - Facturas
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de facturas
 *       403:
 *         description: Rol insuficiente
 */
router.get('/all', validateJwt, authorizeRole('admin'), getAllInvoices);

/**
 * @swagger
 * /brasa33/v1/invoices/{id}:
 *   get:
 *     summary: Obtener factura por ID
 *     description: El propietario del pedido, el gerente o el admin pueden ver la factura.
 *     tags:
 *       - Facturas
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
 *         description: Detalle de la factura
 *       403:
 *         description: Sin permiso para ver esta factura
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:id', validateJwt, getInvoiceById);

export default router;
