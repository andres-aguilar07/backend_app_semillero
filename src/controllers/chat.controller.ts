import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { dbAdapter } from '../db/drizzle-adapter';
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
    
    const role = req.user.role;
    const field = role === 'usuario' ? 'usuario_id' : 'psicologo_id';
    
    const chats = await dbAdapter.chats.findMany({
      where: {
        [field]: req.user.id,
        activo: true
      },
      include: {
        usuario: true,
        psicologo: true
      }
    });
    
    // Formateamos la respuesta para que sea igual que con Prisma
    const formattedChats = chats.map(chat => {
      // @ts-ignore
      const { usuario, psicologo, ...chatData } = chat;
      
      return {
        ...chatData,
        usuario: usuario ? {
          id: usuario.id,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos
        } : null,
        psicologo: psicologo ? {
          id: psicologo.id,
          nombres: psicologo.nombres,
          apellidos: psicologo.apellidos,
          especialidad: psicologo.especialidad
        } : null
      };
    });
    
    res.json(formattedChats);
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

    // Check if Ollama is enabled
    const useOllama = process.env.USE_OLLAMA === 'true';
    
    if (!useOllama) {
      res.status(503).json({ 
        message: 'Servicio de chat con IA no disponible. Ollama no está habilitado.' 
      });
      return;
    }

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