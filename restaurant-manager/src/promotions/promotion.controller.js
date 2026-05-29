import {
  createPromotion as createPromotionService,
  getPublicPromotions as getPublicPromotionsService,
  getAllPromotions as getAllPromotionsService,
  getPromotionById as getPromotionByIdService,
  getPromotionsByRestaurant as getPromotionsByRestaurantService,
  updatePromotion as updatePromotionService,
  approvePromotion as approvePromotionService,
  rejectPromotion as rejectPromotionService,
  deletePromotion as deletePromotionService,
} from './promotion.service.js';

export const createPromotion = async (req, res, next) => {
  try {
    const promotion = await createPromotionService(req.body, req.user.id, req.user);
    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

export const getPublicPromotions = async (req, res, next) => {
  try {
    const promotions = await getPublicPromotionsService();
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    next(error);
  }
};

export const getAllPromotions = async (req, res, next) => {
  try {
    const promotions = await getAllPromotionsService();
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    next(error);
  }
};

export const getPromotionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promotion = await getPromotionByIdService(id);
    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

export const getPromotionsByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const promotions = await getPromotionsByRestaurantService(restaurantId);
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    next(error);
  }
};

export const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promotion = await updatePromotionService(id, req.body, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

export const approvePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promotion = await approvePromotionService(id);
    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

export const rejectPromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promotion = await rejectPromotionService(id);
    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deletePromotionService(id);
    res.status(200).json({ success: true, message: 'Promoción eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};
