import { Response } from 'express';
import { z } from 'zod';
import { and, eq, desc, like, isNull, or } from 'drizzle-orm';
import { db } from '../db';
import * as schema from '../db/schema';
import { AuthRequest } from '../middleware/auth.middleware';
import { chatWithOllama } from '../services/ollama.service';

// Validation schema for messages
const mensajeSchema = z.object({
  mensaje: z.string().min(1, 'El mensaje no puede estar vacío')
});

// Validation schema for AI chat
const chatIASchema = z.object({
  mensaje: z.string().min(1, 'El mensaje no puede estar vacío'),
  contexto: z.string().optional()
});

/**
 * Get all chats for the authenticated user
 */
export const getChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const chats = await db
      .select()
      .from(schema.chats)
      .where(eq(schema.chats.estudiante_id, req.user.id as number))
      .orderBy(desc(schema.chats.ultima_actividad));

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Chat with AI using Ollama
 */
export const chatConIA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Validate request body
    const validationResult = chatIASchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Datos inválidos', 
        errors: validationResult.error.errors 
      });
      return;
    }

    const { mensaje, contexto } = validationResult.data;

    try {
      const respuestaIA = await chatWithOllama(mensaje, contexto);
      
      res.json({
        mensaje_usuario: mensaje,
        respuesta_ia: respuestaIA.respuesta,
        timestamp: respuestaIA.timestamp,
        usuario_id: req.user.id
      });

    } catch (aiError) {
      console.error('Error en chat con IA:', aiError);
      
      res.status(503).json({ 
        message: 'Error comunicándose con el servicio de IA. Por favor, intenta nuevamente.' 
      });
    }

  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Get AI chat history for user (if stored in future)
 */
export const getHistorialChatIA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // For now, return empty history as we're not storing AI chats
    // This can be implemented later if needed
    res.json({
      message: 'Historial de chat con IA',
      historial: [],
      usuario_id: req.user.id
    });

  } catch (error) {
    console.error('Error fetching AI chat history:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 

const chatCreateSchema = z.object({
  estudiante_id: z.number().int().positive(),
  psicologo_id: z.number().int().positive(),
  iniciado_en: z.coerce.date().optional(),
  is_active: z.boolean().optional(),
});

const chatPutSchema = chatCreateSchema.extend({
  finalizado_en: z.coerce.date().nullable().optional(),
  ultima_actividad: z.coerce.date().optional(),
});

const chatPatchSchema = chatPutSchema.partial();

export const listChats = async (req: AuthRequest, res: any) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Usuario no autenticado' });
    const onlyActive = req.query.active === 'true';
    let condition = or(
      eq(schema.chats.estudiante_id, req.user.id as number),
      eq(schema.chats.psicologo_id, req.user.id as number)
    );
    if (onlyActive) {
      condition = and(condition, eq(schema.chats.is_active, true));
    }
    const chats = await db
      .select()
      .from(schema.chats)
      .where(condition)
      .orderBy(desc(schema.chats.ultima_actividad));
    return res.json(chats);
  } catch (error) {
    console.error('Error list chats:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}

export const getChatById = async (req: AuthRequest, res: any) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Usuario no autenticado' });
    const chatId = Number(req.params.chatId);
    if (Number.isNaN(chatId)) return res.status(400).json({ message: 'ID inválido' });
    const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!chat) return res.status(404).json({ message: 'Chat no encontrado' });
    if (!(chat.estudiante_id === req.user.id || chat.psicologo_id === req.user.id)) return res.status(403).json({ message: 'No autorizado' });
    return res.json(chat);
  } catch (error) {
    console.error('Error get chat:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}

export const createChat = async (req: AuthRequest, res: any) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Usuario no autenticado' });
    const parsed = chatCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors });
    const data = parsed.data;
    // Only allow if user is participant
    if (req.user.id !== data.estudiante_id && req.user.id !== data.psicologo_id) return res.status(403).json({ message: 'No autorizado' });
    const now = new Date();
    const [created] = await db.insert(schema.chats).values({
      estudiante_id: data.estudiante_id,
      psicologo_id: data.psicologo_id,
      iniciado_en: data.iniciado_en ?? now,
      ultima_actividad: now,
      is_active: data.is_active ?? true,
    }).returning();
    return res.status(201).json(created);
  } catch (error) {
    console.error('Error create chat:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}

export const updateChatPut = async (req: AuthRequest, res: any) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Usuario no autenticado' });
    const chatId = Number(req.params.chatId);
    if (Number.isNaN(chatId)) return res.status(400).json({ message: 'ID inválido' });
    const parsed = chatPutSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors });
    const [existing] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!existing) return res.status(404).json({ message: 'Chat no encontrado' });
    if (!(existing.estudiante_id === req.user.id || existing.psicologo_id === req.user.id)) return res.status(403).json({ message: 'No autorizado' });
    const data = parsed.data;
    const [updated] = await db.update(schema.chats).set({
      estudiante_id: data.estudiante_id,
      psicologo_id: data.psicologo_id,
      iniciado_en: data.iniciado_en ?? existing.iniciado_en,
      ultima_actividad: data.ultima_actividad ?? new Date(),
      finalizado_en: data.finalizado_en ?? existing.finalizado_en ?? null,
      is_active: data.is_active ?? existing.is_active,
    }).where(eq(schema.chats.id, chatId)).returning();
    return res.json(updated);
  } catch (error) {
    console.error('Error put chat:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}

export const updateChatPatch = async (req: AuthRequest, res: any) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Usuario no autenticado' });
    const chatId = Number(req.params.chatId);
    if (Number.isNaN(chatId)) return res.status(400).json({ message: 'ID inválido' });
    const parsed = chatPatchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors });
    const [existing] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!existing) return res.status(404).json({ message: 'Chat no encontrado' });
    if (!(existing.estudiante_id === req.user.id || existing.psicologo_id === req.user.id)) return res.status(403).json({ message: 'No autorizado' });
    const data = parsed.data;
    const payload: any = {};
    if (data.estudiante_id !== undefined) payload.estudiante_id = data.estudiante_id;
    if (data.psicologo_id !== undefined) payload.psicologo_id = data.psicologo_id;
    if (data.iniciado_en !== undefined) payload.iniciado_en = data.iniciado_en;
    if (data.ultima_actividad !== undefined) payload.ultima_actividad = data.ultima_actividad; else payload.ultima_actividad = new Date();
    if (data.finalizado_en !== undefined) payload.finalizado_en = data.finalizado_en;
    if (data.is_active !== undefined) payload.is_active = data.is_active;
    const [updated] = await db.update(schema.chats).set(payload).where(eq(schema.chats.id, chatId)).returning();
    return res.json(updated);
  } catch (error) {
    console.error('Error patch chat:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}

export const deleteChat = async (req: AuthRequest, res: any) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Usuario no autenticado' });
    const chatId = Number(req.params.chatId);
    if (Number.isNaN(chatId)) return res.status(400).json({ message: 'ID inválido' });
    const [existing] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId)).limit(1);
    if (!existing) return res.status(404).json({ message: 'Chat no encontrado' });
    if (!(existing.estudiante_id === req.user.id || existing.psicologo_id === req.user.id)) return res.status(403).json({ message: 'No autorizado' });
    await db.delete(schema.mensajes_chat).where(eq(schema.mensajes_chat.chat_id, chatId));
    await db.delete(schema.chats).where(eq(schema.chats.id, chatId));
    return res.json({ message: 'Chat eliminado' });
  } catch (error) {
    console.error('Error delete chat:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}