import { Response } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import * as schema from '../db/schema';
import { AuthRequest } from '../middleware/auth.middleware';

const createSchema = z.object({
  usuario_id: z.number().optional(),
  encuesta_id: z.number(),
  respuesta: z.any(),
});

const putSchema = createSchema;
const patchSchema = createSchema.partial();

export const listRespuestas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { usuario_id, encuesta_id } = req.query as any;
    let q = db.select().from(schema.encuestasRespuestas) as any;
    const conditions: any[] = [];
    if (req.user?.role === 'usuario') {
      conditions.push(eq(schema.encuestasRespuestas.usuario_id, req.user.id));
    } else {
      if (usuario_id) conditions.push(eq(schema.encuestasRespuestas.usuario_id, Number(usuario_id)));
    }
    if (encuesta_id) conditions.push(eq(schema.encuestasRespuestas.encuesta_id, Number(encuesta_id)));
    if (conditions.length > 0) {
      q = q.where(and(...conditions));
    }
    const items = await q;
    res.json(items);
  } catch (error) {
    console.error('Error list respuestas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getRespuestaById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const [item] = await db.select().from(schema.encuestasRespuestas).where(eq(schema.encuestasRespuestas.id, id)).limit(1);
    if (!item) { res.status(404).json({ message: 'Respuesta no encontrada' }); return; }
    if (req.user?.role === 'usuario' && item.usuario_id !== req.user.id) {
      res.status(403).json({ message: 'No autorizado' }); return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error get respuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const createRespuesta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const usuarioId = data.usuario_id ?? req.user?.id;
    if (!usuarioId) { res.status(400).json({ message: 'usuario_id requerido' }); return; }
    const [created] = await db.insert(schema.encuestasRespuestas).values({
      usuario_id: usuarioId,
      encuesta_id: data.encuesta_id,
      respuesta: typeof data.respuesta === 'string' ? data.respuesta : JSON.stringify(data.respuesta),
    }).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error('Error create respuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateRespuestaPut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const parsed = putSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [existing] = await db.select().from(schema.encuestasRespuestas).where(eq(schema.encuestasRespuestas.id, id)).limit(1);
    if (!existing) { res.status(404).json({ message: 'Respuesta no encontrada' }); return; }
    if (req.user?.role === 'usuario' && existing.usuario_id !== req.user.id) { res.status(403).json({ message: 'No autorizado' }); return; }
    const [updated] = await db.update(schema.encuestasRespuestas).set({
      usuario_id: data.usuario_id ?? existing.usuario_id,
      encuesta_id: data.encuesta_id,
      respuesta: typeof data.respuesta === 'string' ? data.respuesta : JSON.stringify(data.respuesta),
      updated_at: new Date(),
    }).where(eq(schema.encuestasRespuestas.id, id)).returning();
    res.json(updated);
  } catch (error) {
    console.error('Error put respuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateRespuestaPatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [existing] = await db.select().from(schema.encuestasRespuestas).where(eq(schema.encuestasRespuestas.id, id)).limit(1);
    if (!existing) { res.status(404).json({ message: 'Respuesta no encontrada' }); return; }
    if (req.user?.role === 'usuario' && existing.usuario_id !== req.user.id) { res.status(403).json({ message: 'No autorizado' }); return; }
    const payload: any = { updated_at: new Date() };
    if (data.usuario_id !== undefined) payload.usuario_id = data.usuario_id;
    if (data.encuesta_id !== undefined) payload.encuesta_id = data.encuesta_id;
    if (data.respuesta !== undefined) payload.respuesta = typeof data.respuesta === 'string' ? data.respuesta : JSON.stringify(data.respuesta);
    const [updated] = await db.update(schema.encuestasRespuestas).set(payload).where(eq(schema.encuestasRespuestas.id, id)).returning();
    res.json(updated);
  } catch (error) {
    console.error('Error patch respuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const deleteRespuesta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const [existing] = await db.select().from(schema.encuestasRespuestas).where(eq(schema.encuestasRespuestas.id, id)).limit(1);
    if (!existing) { res.status(404).json({ message: 'Respuesta no encontrada' }); return; }
    if (req.user?.role === 'usuario' && existing.usuario_id !== req.user.id) { res.status(403).json({ message: 'No autorizado' }); return; }
    await db.delete(schema.encuestasRespuestas).where(eq(schema.encuestasRespuestas.id, id));
    res.json({ message: 'Respuesta eliminada' });
  } catch (error) {
    console.error('Error delete respuesta:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};