import { Router } from 'express';
import { validateJwt } from '../middlewares/validateJwt.js';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from './notification.controller.js';

const router = Router();

router.get('/', validateJwt, getMyNotifications);
router.put('/:id/read', validateJwt, markAsRead);
router.put('/read-all', validateJwt, markAllAsRead);

export default router;
