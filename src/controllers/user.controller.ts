import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Get current authenticated user profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const user = await prisma.usuario.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        id: true,
        correo: true,
        nombres: true,
        apellidos: true,
        telefono: true,
        edad: true,
        sexo: true,
        fecha_registro: true
      }
    });
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 