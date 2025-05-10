import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

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
    
    const chats = await prisma.chat.findMany({
      where: {
        [field]: req.user.id,
        activo: true
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        },
        psicologo: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            especialidad: true
          }
        }
      },
      orderBy: {
        creado_en: 'desc'
      }
    });
    
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 