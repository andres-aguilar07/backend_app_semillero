import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user/psychologist and get token
 * @access Public
 */
router.post('/login', authController.login);

export default router; 