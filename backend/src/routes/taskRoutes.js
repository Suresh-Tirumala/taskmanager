import express from 'express';
import { body } from 'express-validator';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
  getDashboardStats
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/my-tasks', protect, getMyTasks);

router.route('/')
  .get(protect, getTasks)
  .post(protect, [
    body('title', 'Task title is required').notEmpty().trim(),
    body('project', 'Project is required').notEmpty()
  ], validate, createTask);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

export default router;