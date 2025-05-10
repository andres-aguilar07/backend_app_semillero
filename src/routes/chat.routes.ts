import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/chats
 * @desc Get all chats for the authenticated user
 * @access Private
 */
router.get('/', authenticate, chatController.getChats);

export default router; 