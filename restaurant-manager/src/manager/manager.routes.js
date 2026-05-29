import { Router } from 'express';
import { getMyRestaurant } from './manager.controller.js';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = Router();

router.get(
  '/my-restaurant',
  validateJwt,
  authorizeRole('manager'),
  getMyRestaurant,
);

export default router;
