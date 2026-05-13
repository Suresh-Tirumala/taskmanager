import express from 'express';
import { body } from 'express-validator';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, isAdmin, [
    body('title', 'Project title is required').notEmpty().trim()
  ], validate, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, isAdmin, updateProject)
  .delete(protect, isAdmin, deleteProject);

export default router;