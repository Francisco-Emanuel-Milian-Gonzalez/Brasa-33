import {
  listInventory,
  addInventoryItem,
  editInventoryItem,
  removeInventoryItem,
} from './inventory.service.js';

export const getInventory = async (req, res, next) => {
  try {
    const items = await listInventory(req.user.id);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const createInventory = async (req, res, next) => {
  try {
    const item = await addInventoryItem(req.user.id, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateInventory = async (req, res, next) => {
  try {
    const item = await editInventoryItem(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteInventory = async (req, res, next) => {
  try {
    await removeInventoryItem(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Ingrediente eliminado' });
  } catch (error) {
    next(error);
  }
};
