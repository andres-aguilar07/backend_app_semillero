import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, isUsuario } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/users/profile
 * @desc Get authenticated user profile
 * @access Private
 */
router.get('/profile', authenticate, isUsuario, userController.getProfile);

export default router; 