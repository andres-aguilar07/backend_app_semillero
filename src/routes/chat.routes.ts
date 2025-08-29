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

/**
 * @route POST /api/chats/ia
 * @desc Chat with AI using Ollama
 * @access Private
 */
router.post('/ia', authenticate, chatController.chatConIA);

/**
 * @route GET /api/chats/ia/historial
 * @desc Get AI chat history for user
 * @access Private
 */
router.get('/ia/historial', authenticate, chatController.getHistorialChatIA);

export default router; 