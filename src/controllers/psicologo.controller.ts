import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { dbAdapter } from '../db/drizzle-adapter';

/**
 * Get all active psychologists
 */
export const getPsicologos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const psicologos = await dbAdapter.psicologos.findMany({
      where: {
        activo: true
      }
    });
    
    // Filtramos los campos que queremos devolver
    const psicologosFiltrados = psicologos.map(psicologo => ({
      id: psicologo.id,
      nombres: psicologo.nombres,
      apellidos: psicologo.apellidos,
      especialidad: psicologo.especialidad
    }));
    
    res.json(psicologosFiltrados);
  } catch (error) {
    console.error('Error fetching psychologists:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 