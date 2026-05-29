import { Router } from 'express';
import { validateJwt } from '../middlewares/validateJwt.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} from './inventory.controller.js';

const router = Router();
const managerOnly = [validateJwt, authorizeRole('manager', 'admin')];

router.get('/', ...managerOnly, getInventory);
router.post('/', ...managerOnly, createInventory);
router.put('/:id', ...managerOnly, updateInventory);
router.delete('/:id', ...managerOnly, deleteInventory);

export default router;
