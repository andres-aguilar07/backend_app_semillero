import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get current authenticated user profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const [user] = await db
      .select()
      .from(schema.usuarios)
      .where(eq(schema.usuarios.id, req.user.id as number))
      .limit(1);
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Eliminamos la contraseña antes de devolver el usuario
    const { contrasena, ...userSinContrasena } = user;
    
    res.json(userSinContrasena);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 