import {
  createReview as createReviewService,
  getReviewsByRestaurant as getReviewsByRestaurantService,
  getReviewsByDish as getReviewsByDishService,
  getMyReviews as getMyReviewsService,
  updateReview as updateReviewService,
  deleteReview as deleteReviewService,
} from './review.service.js';

export const createReview = async (req, res, next) => {
  try {
    const review = await createReviewService(req.body, req.user.id);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const result = await getReviewsByRestaurantService(restaurantId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByDish = async (req, res, next) => {
  try {
    const { menuId } = req.params;
    const result = await getReviewsByDishService(menuId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await getMyReviewsService(req.user.id);
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await updateReviewService(id, req.body, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteReviewService(id, req.user.id, req.user.role);
    res.status(200).json({ success: true, message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};
