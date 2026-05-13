import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getMe, getAllUsers } from '../controllers/authController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register', [
  body('name', 'Name is required').notEmpty().trim(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('role', 'Role must be admin or member').isIn(['admin', 'member'])
], validate, registerUser);

router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').notEmpty()
], validate, loginUser);

router.get('/me', protect, getMe);
router.get('/users', protect, isAdmin, getAllUsers);

export default router;