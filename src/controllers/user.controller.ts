import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.middleware';

const userCreateSchema = z.object({
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  correo: z.string().email(),
  contrasena: z.string().min(6),
});

const userPutSchema = userCreateSchema;
const userPatchSchema = userCreateSchema.partial();

export const listUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await db
      .select({
        id: schema.usuarios.id,
        correo: schema.usuarios.correo,
        nombres: schema.usuarios.nombres,
        apellidos: schema.usuarios.apellidos,
        id_rol: schema.usuarios.id_rol,
      })
      .from(schema.usuarios);
    res.json(users);
  } catch (error) {
    console.error('Error list users:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = userCreateSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [exists] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.correo, data.correo)).limit(1);
    if (exists) { res.status(409).json({ message: 'El correo ya está registrado' }); return; }
    const hashed = await bcrypt.hash(data.contrasena, 10);
    const [created] = await db
      .insert(schema.usuarios)
      .values({ nombres: data.nombres, apellidos: data.apellidos, correo: data.correo, contrasena: hashed })
      .returning({ id: schema.usuarios.id, correo: schema.usuarios.correo, nombres: schema.usuarios.nombres, apellidos: schema.usuarios.apellidos });
    res.status(201).json(created);
  } catch (error) {
    console.error('Error create user:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateUserPut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const parsed = userPutSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [existing] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, userId)).limit(1);
    if (!existing) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
    // Access: psicólogo o dueño
    if (req.user?.role !== 'psicologo' && req.user?.id !== userId) { res.status(403).json({ message: 'No autorizado' }); return; }
    const hashed = await bcrypt.hash(data.contrasena, 10);
    const [updated] = await db
      .update(schema.usuarios)
      .set({ nombres: data.nombres, apellidos: data.apellidos, correo: data.correo, contrasena: hashed, updated_at: new Date() })
      .where(eq(schema.usuarios.id, userId))
      .returning({ id: schema.usuarios.id, correo: schema.usuarios.correo, nombres: schema.usuarios.nombres, apellidos: schema.usuarios.apellidos });
    res.json(updated);
  } catch (error) {
    console.error('Error put user:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateUserPatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const parsed = userPatchSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const [existing] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, userId)).limit(1);
    if (!existing) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
    if (req.user?.role !== 'psicologo' && req.user?.id !== userId) { res.status(403).json({ message: 'No autorizado' }); return; }
    const data = parsed.data;
    const payload: any = { updated_at: new Date() };
    if (data.nombres !== undefined) payload.nombres = data.nombres;
    if (data.apellidos !== undefined) payload.apellidos = data.apellidos;
    if (data.correo !== undefined) payload.correo = data.correo;
    if (data.contrasena !== undefined) payload.contrasena = await bcrypt.hash(data.contrasena, 10);
    const [updated] = await db.update(schema.usuarios).set(payload).where(eq(schema.usuarios.id, userId)).returning({ id: schema.usuarios.id, correo: schema.usuarios.correo, nombres: schema.usuarios.nombres, apellidos: schema.usuarios.apellidos });
    res.json(updated);
  } catch (error) {
    console.error('Error patch user:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const [existing] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, userId)).limit(1);
    if (!existing) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
    if (req.user?.role !== 'psicologo') { res.status(403).json({ message: 'No autorizado' }); return; }
    await db.delete(schema.usuarios).where(eq(schema.usuarios.id, userId));
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error delete user:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getUserById = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const [user] = await db
      .select()
      .from(schema.usuarios)
      .where(eq(schema.usuarios.id, Number(userId)))
      .limit(1);

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

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