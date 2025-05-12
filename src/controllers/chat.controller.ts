import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { dbAdapter } from '../db/drizzle-adapter';

// Validation schema for messages
const mensajeSchema = z.object({
  mensaje: z.string().min(1, 'El mensaje no puede estar vacío')
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