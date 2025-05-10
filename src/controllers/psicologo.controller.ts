import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Get all active psychologists
 */
export const getPsicologos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const psicologos = await prisma.psicologo.findMany({
      where: {
        activo: true
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        especialidad: true
      }
    });
    
    res.json(psicologos);
  } catch (error) {
    console.error('Error fetching psychologists:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 