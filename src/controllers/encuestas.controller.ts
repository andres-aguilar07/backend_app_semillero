import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import * as schema from '../db/schema';
import { AuthRequest } from '../middleware/auth.middleware';

const encuestaSchema = z.object({
  codigo: z.string().min(1),
  titulo: z.string().min(1),
  opciones: z.any().optional(),
});

const encuestaPatchSchema = encuestaSchema.partial();

export const listEncuestas = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await db.select().from(schema.encuestas);
    res.json(items);
  } catch (error) {
    console.error('Error listing encuestas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getEncuestaById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const [item] = await db.select().from(schema.encuestas).where(eq(schema.encuestas.id, id)).limit(1);
    if (!item) { res.status(404).json({ message: 'Encuesta no encontrada' }); return; }
    res.json(item);
  } catch (error) {
    console.error('Error getting encuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const createEncuesta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = encuestaSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [created] = await db.insert(schema.encuestas).values({
      codigo: data.codigo,
      titulo: data.titulo,
      opciones: data.opciones ? JSON.stringify(data.opciones) : null,
    }).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating encuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateEncuestaPut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const parsed = encuestaSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [updated] = await db.update(schema.encuestas).set({
      codigo: data.codigo,
      titulo: data.titulo,
      opciones: data.opciones ? JSON.stringify(data.opciones) : null,
      updated_at: new Date(),
    }).where(eq(schema.encuestas.id, id)).returning();
    if (!updated) { res.status(404).json({ message: 'Encuesta no encontrada' }); return; }
    res.json(updated);
  } catch (error) {
    console.error('Error updating encuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateEncuestaPatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const parsed = encuestaPatchSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const payload: any = { updated_at: new Date() };
    if (data.codigo !== undefined) payload.codigo = data.codigo;
    if (data.titulo !== undefined) payload.titulo = data.titulo;
    if (data.opciones !== undefined) payload.opciones = data.opciones ? JSON.stringify(data.opciones) : null;
    const [updated] = await db.update(schema.encuestas).set(payload).where(eq(schema.encuestas.id, id)).returning();
    if (!updated) { res.status(404).json({ message: 'Encuesta no encontrada' }); return; }
    res.json(updated);
  } catch (error) {
    console.error('Error patch encuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const deleteEncuesta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const [deleted] = await db.delete(schema.encuestas).where(eq(schema.encuestas.id, id)).returning();
    if (!deleted) { res.status(404).json({ message: 'Encuesta no encontrada' }); return; }
    res.json({ message: 'Encuesta eliminada' });
  } catch (error) {
    console.error('Error deleting encuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};