import { Response } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import * as schema from '../db/schema';
import { AuthRequest } from '../middleware/auth.middleware';

const diarioSchema = z.object({
  titulo: z.string().min(1),
  contenido: z.string().min(1),
  fecha: z.string().datetime().optional(),
});

const diarioPatchSchema = diarioSchema.partial();

export const listDiario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const items = await db.select().from(schema.diario).where(eq(schema.diario.usuario_id, req.user.id));
    res.json(items);
  } catch (error) {
    console.error('Error list diario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getDiarioById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const [item] = await db.select().from(schema.diario).where(eq(schema.diario.id, id)).limit(1);
    if (!item) { res.status(404).json({ message: 'Entrada no encontrada' }); return; }
    if (item.usuario_id !== req.user.id) { res.status(403).json({ message: 'No autorizado' }); return; }
    res.json(item);
  } catch (error) {
    console.error('Error get diario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const createDiario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const parsed = diarioSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [created] = await db.insert(schema.diario).values({
      usuario_id: req.user.id,
      titulo: data.titulo,
      contenido: data.contenido,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
    }).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error('Error create diario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateDiarioPut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const id = Number(req.params.id);
    const parsed = diarioSchema.safeParse(req.body);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const [existing] = await db.select().from(schema.diario).where(eq(schema.diario.id, id)).limit(1);
    if (!existing) { res.status(404).json({ message: 'Entrada no encontrada' }); return; }
    if (existing.usuario_id !== req.user.id) { res.status(403).json({ message: 'No autorizado' }); return; }
    const data = parsed.data;
    const [updated] = await db.update(schema.diario).set({
      titulo: data.titulo,
      contenido: data.contenido,
      fecha: data.fecha ? new Date(data.fecha) : existing.fecha,
      updated_at: new Date(),
    }).where(eq(schema.diario.id, id)).returning();
    res.json(updated);
  } catch (error) {
    console.error('Error put diario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateDiarioPatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const id = Number(req.params.id);
    const parsed = diarioPatchSchema.safeParse(req.body);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const [existing] = await db.select().from(schema.diario).where(eq(schema.diario.id, id)).limit(1);
    if (!existing) { res.status(404).json({ message: 'Entrada no encontrada' }); return; }
    if (existing.usuario_id !== req.user.id) { res.status(403).json({ message: 'No autorizado' }); return; }
    const data = parsed.data;
    const payload: any = { updated_at: new Date() };
    if (data.titulo !== undefined) payload.titulo = data.titulo;
    if (data.contenido !== undefined) payload.contenido = data.contenido;
    if (data.fecha !== undefined) payload.fecha = data.fecha ? new Date(data.fecha) : null;
    const [updated] = await db.update(schema.diario).set(payload).where(eq(schema.diario.id, id)).returning();
    res.json(updated);
  } catch (error) {
    console.error('Error patch diario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const deleteDiario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'Usuario no autenticado' }); return; }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const [existing] = await db.select().from(schema.diario).where(eq(schema.diario.id, id)).limit(1);
    if (!existing) { res.status(404).json({ message: 'Entrada no encontrada' }); return; }
    if (existing.usuario_id !== req.user.id) { res.status(403).json({ message: 'No autorizado' }); return; }
    await db.delete(schema.diario).where(eq(schema.diario.id, id));
    res.json({ message: 'Entrada eliminada' });
  } catch (error) {
    console.error('Error delete diario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};