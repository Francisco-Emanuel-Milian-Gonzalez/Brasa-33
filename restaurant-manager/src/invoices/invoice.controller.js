import {
  generateInvoice as generateInvoiceService,
  getInvoiceById as getInvoiceByIdService,
  getInvoiceByOrder as getInvoiceByOrderService,
  getMyInvoices as getMyInvoicesService,
  getAllInvoices as getAllInvoicesService,
} from './invoice.service.js';

export const generateInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const result = await generateInvoiceService(orderId, req.user.id, req.user.role);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await getInvoiceByIdService(id, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const invoice = await getInvoiceByOrderService(orderId, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await getMyInvoicesService(req.user.id);
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await getAllInvoicesService();
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};
