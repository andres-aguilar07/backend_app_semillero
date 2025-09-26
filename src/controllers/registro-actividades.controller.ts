import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import * as schema from '../db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.middleware';

const createSchema = z.object({
  opcion_id: z.number().int().positive(),
  vencimiento: z.coerce.date().optional(),
  fecha: z.coerce.date().optional(),
  observaciones: z.string().optional(),
});

const putSchema = createSchema;
const patchSchema = createSchema.partial();

export const listRegistros = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'No autenticado' }); return; }
    const registros = await db
      .select()
      .from(schema.registro_actividades_usuarios)
      .where(eq(schema.registro_actividades_usuarios.usuario_id, req.user.id as number))
      .orderBy(desc(schema.registro_actividades_usuarios.fecha));
    res.json(registros);
  } catch (error) {
    console.error('Error list registros actividades:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getRegistroById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    if (!req.user?.id) { res.status(401).json({ message: 'No autenticado' }); return; }
    const [registro] = await db
      .select()
      .from(schema.registro_actividades_usuarios)
      .where(and(eq(schema.registro_actividades_usuarios.id, id), eq(schema.registro_actividades_usuarios.usuario_id, req.user.id as number)))
      .limit(1);
    if (!registro) { res.status(404).json({ message: 'Registro no encontrado' }); return; }
    res.json(registro);
  } catch (error) {
    console.error('Error get registro actividad:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const createRegistro = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ message: 'No autenticado' }); return; }
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [inserted] = await db
      .insert(schema.registro_actividades_usuarios)
      .values({
        usuario_id: req.user.id as number,
        opcion_id: data.opcion_id,
        vencimiento: data.vencimiento ?? new Date(),
        fecha: data.fecha ?? new Date(),
        observaciones: data.observaciones,
      })
      .returning();
    res.status(201).json(inserted);
  } catch (error) {
    console.error('Error create registro actividad:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateRegistroPut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    if (!req.user?.id) { res.status(401).json({ message: 'No autenticado' }); return; }
    const parsed = putSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [existing] = await db
      .select({ id: schema.registro_actividades_usuarios.id })
      .from(schema.registro_actividades_usuarios)
      .where(and(eq(schema.registro_actividades_usuarios.id, id), eq(schema.registro_actividades_usuarios.usuario_id, req.user.id as number)))
      .limit(1);
    if (!existing) { res.status(404).json({ message: 'Registro no encontrado' }); return; }
    const [updated] = await db
      .update(schema.registro_actividades_usuarios)
      .set({
        opcion_id: data.opcion_id,
        vencimiento: data.vencimiento ?? new Date(),
        fecha: data.fecha ?? new Date(),
        observaciones: data.observaciones,
        updated_at: new Date(),
      })
      .where(eq(schema.registro_actividades_usuarios.id, id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error('Error put registro actividad:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const updateRegistroPatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    if (!req.user?.id) { res.status(401).json({ message: 'No autenticado' }); return; }
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors }); return; }
    const data = parsed.data;
    const [existing] = await db
      .select({ id: schema.registro_actividades_usuarios.id })
      .from(schema.registro_actividades_usuarios)
      .where(and(eq(schema.registro_actividades_usuarios.id, id), eq(schema.registro_actividades_usuarios.usuario_id, req.user.id as number)))
      .limit(1);
    if (!existing) { res.status(404).json({ message: 'Registro no encontrado' }); return; }
    const payload: any = { updated_at: new Date() };
    if (data.opcion_id !== undefined) payload.opcion_id = data.opcion_id;
    if (data.vencimiento !== undefined) payload.vencimiento = data.vencimiento;
    if (data.fecha !== undefined) payload.fecha = data.fecha;
    if (data.observaciones !== undefined) payload.observaciones = data.observaciones;
    const [updated] = await db
      .update(schema.registro_actividades_usuarios)
      .set(payload)
      .where(eq(schema.registro_actividades_usuarios.id, id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error('Error patch registro actividad:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const deleteRegistro = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    if (!req.user?.id) { res.status(401).json({ message: 'No autenticado' }); return; }
    const [existing] = await db
      .select({ id: schema.registro_actividades_usuarios.id })
      .from(schema.registro_actividades_usuarios)
      .where(and(eq(schema.registro_actividades_usuarios.id, id), eq(schema.registro_actividades_usuarios.usuario_id, req.user.id as number)))
      .limit(1);
    if (!existing) { res.status(404).json({ message: 'Registro no encontrado' }); return; }
    await db.delete(schema.registro_actividades_usuarios).where(eq(schema.registro_actividades_usuarios.id, id));
    res.json({ message: 'Registro eliminado' });
  } catch (error) {
    console.error('Error delete registro actividad:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};