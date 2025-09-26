import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import * as schema from '../db/schema';

const optionSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  url_imagen: z.string().min(1),
});
const optionPatchSchema = optionSchema.partial();

export const listOpciones = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await db.select().from(schema.opciones_registro_actividades);
    res.json(items);
  } catch (error) {
    console.error('Error list opciones:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getOpcionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const [item] = await db.select().from(schema.opciones_registro_actividades).where(eq(schema.opciones_registro_actividades.id, id)).limit(1);
    if (!item) { res.status(404).json({ message: 'Opción no encontrada' }); return; }
    res.json(item);
  } catch (error) {
    console.error('Error get opción:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const createOpcion = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = optionSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [created] = await db.insert(schema.opciones_registro_actividades).values({
      nombre: data.nombre,
      descripcion: data.descripcion,
      url_imagen: data.url_imagen,
    }).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error('Error create opción:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateOpcionPut = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const parsed = optionSchema.safeParse(req.body);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [updated] = await db.update(schema.opciones_registro_actividades).set({
      nombre: data.nombre,
      descripcion: data.descripcion,
      url_imagen: data.url_imagen,
      updated_at: new Date(),
    }).where(eq(schema.opciones_registro_actividades.id, id)).returning();
    if (!updated) { res.status(404).json({ message: 'Opción no encontrada' }); return; }
    res.json(updated);
  } catch (error) {
    console.error('Error put opción:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateOpcionPatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const parsed = optionPatchSchema.safeParse(req.body);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const payload: any = { updated_at: new Date() };
    if (data.nombre !== undefined) payload.nombre = data.nombre;
    if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
    if (data.url_imagen !== undefined) payload.url_imagen = data.url_imagen;
    const [updated] = await db.update(schema.opciones_registro_actividades).set(payload).where(eq(schema.opciones_registro_actividades.id, id)).returning();
    if (!updated) { res.status(404).json({ message: 'Opción no encontrada' }); return; }
    res.json(updated);
  } catch (error) {
    console.error('Error patch opción:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const deleteOpcion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const [deleted] = await db.delete(schema.opciones_registro_actividades).where(eq(schema.opciones_registro_actividades.id, id)).returning();
    if (!deleted) { res.status(404).json({ message: 'Opción no encontrada' }); return; }
    res.json({ message: 'Opción eliminada' });
  } catch (error) {
    console.error('Error delete opción:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};