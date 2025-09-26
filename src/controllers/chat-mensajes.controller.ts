import { Response } from 'express';
import { z } from 'zod';
import { and, eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.middleware';
import { db } from '../db';
import * as schema from '../db/schema';

const mensajeSchema = z.object({
  mensaje: z.string().min(1),
  usuario_id: z.number().optional(),
});
const mensajePatchSchema = mensajeSchema.partial();

function assertCanAccessChat(userId: number | undefined, chat: any): boolean {
  if (!userId) return false;
  return chat.estudiante_id === userId || chat.psicologo_id === userId;
}

export const listMensajes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const chatId = Number(req.params.chatId);
    if (Number.isNaN(chatId)) { res.status(400).json({ message: 'chatId inválido' }); return; }
    const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!chat) { res.status(404).json({ message: 'Chat no encontrado' }); return; }
    if (!assertCanAccessChat(req.user.id, chat)) { res.status(403).json({ message: 'No autorizado' }); return; }
    const mensajes = await db.select().from(schema.mensajes_chat).where(eq(schema.mensajes_chat.chat_id, chatId)).orderBy(desc(schema.mensajes_chat.enviado_en));
    res.json(mensajes);
  } catch (error) {
    console.error('Error list mensajes:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getMensajeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const chatId = Number(req.params.chatId);
    const mensajeId = Number(req.params.mensajeId);
    if (Number.isNaN(chatId) || Number.isNaN(mensajeId)) { res.status(400).json({ message: 'IDs inválidos' }); return; }
    const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!chat) { res.status(404).json({ message: 'Chat no encontrado' }); return; }
    if (!assertCanAccessChat(req.user.id, chat)) { res.status(403).json({ message: 'No autorizado' }); return; }
    const [mensaje] = await db.select().from(schema.mensajes_chat).where(and(eq(schema.mensajes_chat.id, mensajeId), eq(schema.mensajes_chat.chat_id, chatId))).limit(1);
    if (!mensaje) { res.status(404).json({ message: 'Mensaje no encontrado' }); return; }
    res.json(mensaje);
  } catch (error) {
    console.error('Error get mensaje:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const createMensaje = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const chatId = Number(req.params.chatId);
    if (Number.isNaN(chatId)) { res.status(400).json({ message: 'chatId inválido' }); return; }
    const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!chat) { res.status(404).json({ message: 'Chat no encontrado' }); return; }
    if (!assertCanAccessChat(req.user.id, chat)) { res.status(403).json({ message: 'No autorizado' }); return; }
    const parsed = mensajeSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const usuarioId = data.usuario_id ?? req.user.id;
    const [created] = await db.insert(schema.mensajes_chat).values({
      chat_id: chatId,
      usuario_id: usuarioId,
      mensaje: data.mensaje,
    }).returning();
    // update chat last activity
    await db.update(schema.chats).set({ ultima_actividad: new Date() }).where(eq(schema.chats.id, chatId));
    res.status(201).json(created);
  } catch (error) {
    console.error('Error create mensaje:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateMensajePut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const chatId = Number(req.params.chatId);
    const mensajeId = Number(req.params.mensajeId);
    if (Number.isNaN(chatId) || Number.isNaN(mensajeId)) { res.status(400).json({ message: 'IDs inválidos' }); return; }
    const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!chat) { res.status(404).json({ message: 'Chat no encontrado' }); return; }
    if (!assertCanAccessChat(req.user.id, chat)) { res.status(403).json({ message: 'No autorizado' }); return; }
    const parsed = mensajeSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [existing] = await db.select().from(schema.mensajes_chat).where(and(eq(schema.mensajes_chat.id, mensajeId), eq(schema.mensajes_chat.chat_id, chatId))).limit(1);
    if (!existing) { res.status(404).json({ message: 'Mensaje no encontrado' }); return; }
    const [updated] = await db.update(schema.mensajes_chat).set({
      mensaje: data.mensaje,
      usuario_id: data.usuario_id ?? existing.usuario_id,
      updated_at: new Date(),
    }).where(eq(schema.mensajes_chat.id, mensajeId)).returning();
    res.json(updated);
  } catch (error) {
    console.error('Error put mensaje:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateMensajePatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const chatId = Number(req.params.chatId);
    const mensajeId = Number(req.params.mensajeId);
    if (Number.isNaN(chatId) || Number.isNaN(mensajeId)) { res.status(400).json({ message: 'IDs inválidos' }); return; }
    const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!chat) { res.status(404).json({ message: 'Chat no encontrado' }); return; }
    if (!assertCanAccessChat(req.user.id, chat)) { res.status(403).json({ message: 'No autorizado' }); return; }
    const parsed = mensajePatchSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [existing] = await db.select().from(schema.mensajes_chat).where(and(eq(schema.mensajes_chat.id, mensajeId), eq(schema.mensajes_chat.chat_id, chatId))).limit(1);
    if (!existing) { res.status(404).json({ message: 'Mensaje no encontrado' }); return; }
    const payload: any = { updated_at: new Date() };
    if (data.mensaje !== undefined) payload.mensaje = data.mensaje;
    if (data.usuario_id !== undefined) payload.usuario_id = data.usuario_id;
    const [updated] = await db.update(schema.mensajes_chat).set(payload).where(eq(schema.mensajes_chat.id, mensajeId)).returning();
    res.json(updated);
  } catch (error) {
    console.error('Error patch mensaje:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const deleteMensaje = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const chatId = Number(req.params.chatId);
    const mensajeId = Number(req.params.mensajeId);
    if (Number.isNaN(chatId) || Number.isNaN(mensajeId)) { res.status(400).json({ message: 'IDs inválidos' }); return; }
    const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!chat) { res.status(404).json({ message: 'Chat no encontrado' }); return; }
    if (!assertCanAccessChat(req.user.id, chat)) { res.status(403).json({ message: 'No autorizado' }); return; }
    const [existing] = await db.select().from(schema.mensajes_chat).where(and(eq(schema.mensajes_chat.id, mensajeId), eq(schema.mensajes_chat.chat_id, chatId))).limit(1);
    if (!existing) { res.status(404).json({ message: 'Mensaje no encontrado' }); return; }
    await db.delete(schema.mensajes_chat).where(eq(schema.mensajes_chat.id, mensajeId));
    res.json({ message: 'Mensaje eliminado' });
  } catch (error) {
    console.error('Error delete mensaje:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};