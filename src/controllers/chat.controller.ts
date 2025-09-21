import { Response } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.middleware';
import { chatWithOllama } from '../services/ollama.service';
import { db } from '../db';
import * as schema from '../db/schema';

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