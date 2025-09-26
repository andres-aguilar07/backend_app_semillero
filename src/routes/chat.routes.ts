import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listChats, getChatById, createChat, updateChatPut, updateChatPatch, deleteChat, chatConIA, getHistorialChatIA } from '../controllers/chat.controller';
import { createMensaje, deleteMensaje, getMensajeById, listMensajes, updateMensajePatch, updateMensajePut } from '../controllers/chat-mensajes.controller';

const router = Router();

// CRUD de Chats
router.get('/', authenticate, listChats)
router.get('/:chatId', authenticate, getChatById)
router.post('/', authenticate, createChat)
router.put('/:chatId', authenticate, updateChatPut)
router.patch('/:chatId', authenticate, updateChatPatch)
router.delete('/:chatId', authenticate, deleteChat)

// Subrutas de Mensajes
router.get('/:chatId/mensajes', authenticate, listMensajes)
router.get('/:chatId/mensajes/:mensajeId', authenticate, getMensajeById)
router.post('/:chatId/mensajes', authenticate, createMensaje)
router.put('/:chatId/mensajes/:mensajeId', authenticate, updateMensajePut)
router.patch('/:chatId/mensajes/:mensajeId', authenticate, updateMensajePatch)
router.delete('/:chatId/mensajes/:mensajeId', authenticate, deleteMensaje)

// Rutas IA existentes
router.post('/ia', authenticate, chatConIA);
router.get('/ia/historial', authenticate, getHistorialChatIA);

export default router;