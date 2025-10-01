import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { usuarios } from '../db/schema';
import bcrypt from 'bcrypt';
import { registerSchema } from "./auth.controller";

/**
 * Register a new psychologist
 */
export const registerPsychologist = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errors: validationResult.error.errors
      });
      return;
    }

    const userData = validationResult.data;

    // Check if user already exists
    const existingUser = await db.select()
      .from(usuarios)
      .where(eq(usuarios.correo, userData.correo))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(400).json({ message: 'El correo ya está registrado' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);

    // Create user - aseguramos que todos los campos requeridos están explícitamente establecidos
    const [newUser] = await db.insert(usuarios)
      .values({
        correo: userData.correo,
        contrasena: hashedPassword,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        telefono: userData.telefono,
        ciudad: userData.ciudad,
        edad: userData.edad,
        sexo: userData.sexo,
        id_rol: 2
      })
      .returning({
        id: usuarios.id,
        correo: usuarios.correo,
        nombres: usuarios.nombres,
        apellidos: usuarios.apellidos,
      });

    // Return user data and token
    res.status(201).json({
      message: 'Psicologo registrado exitosamente',
      user: newUser
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Get count of users with id_rol = 2, 3
 */
export const countUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db
      .select({
        rol: schema.usuarios.id_rol,
        total: sql<number>`count(*)`
      })
      .from(schema.usuarios)
      .where(sql`id_rol in (2, 3)`) // Solo roles 2 (psicologo) y 3 (usuario)
      .groupBy(schema.usuarios.id_rol);

    // Convertimos resultado a objeto más claro
    const counts = {
      usuarios: result.find(r => r.rol === 3)?.total || 0,
      psicologos: result.find(r => r.rol === 2)?.total || 0,
    };

    res.json(counts);
  } catch (error) {
    console.error("Error contando usuarios y psicólogos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/**
 * Get all users with id_rol = 3
 */
export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db
      .select({
        id: schema.usuarios.id,
        nombres: schema.usuarios.nombres,
        correo: schema.usuarios.correo,
      })
      .from(schema.usuarios)
      .where(eq(schema.usuarios.id_rol, 3));

    res.json(result);
  } catch (error) {
    console.error("Error obteniendo estudiantes:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/**
 * Get student by id
 */
export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Falta el ID del estudiante" });
      return;
    }

    const [student] = await db
      .select({
        id: schema.usuarios.id,
        nombres: schema.usuarios.nombres,
        apellidos: schema.usuarios.apellidos,
        correo: schema.usuarios.correo,
        ciudad: schema.usuarios.ciudad,
        telefono: schema.usuarios.telefono,
        semestre_actual: schema.usuarios.semestre_actual,
        edad: schema.usuarios.edad,
        sexo: schema.usuarios.sexo,
        fecha_nacimiento: schema.usuarios.fecha_nacimiento
      })
      .from(schema.usuarios)
      .where(eq(schema.usuarios.id, Number(id)))
      .limit(1);

    if (!student) {
      res.status(404).json({ message: "Estudiante no encontrado" });
      return;
    }

    res.json(student);
  } catch (error) {
    console.error("Error obteniendo estudiante:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/**
 * Get all users with id_rol = 2
 */
export const getPsychologists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db
      .select({
         id: schema.usuarios.id,
        nombres: schema.usuarios.nombres,
        apellidos: schema.usuarios.apellidos,
        correo: schema.usuarios.correo,
        ciudad: schema.usuarios.ciudad,
        telefono: schema.usuarios.telefono,
        edad: schema.usuarios.edad,
        sexo: schema.usuarios.sexo
      })
      .from(schema.usuarios)
      .where(eq(schema.usuarios.id_rol, 2));

    res.json(result);
  } catch (error) {
    console.error("Error obteniendo psicologos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/**
 * Get psychologist by id
 */
export const getPsychologistById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Falta el ID del psicologo" });
      return;
    }

    const [psychologist] = await db
      .select({
        id: schema.usuarios.id,
        nombres: schema.usuarios.nombres,
        apellidos: schema.usuarios.apellidos,
        correo: schema.usuarios.correo,
        ciudad: schema.usuarios.ciudad,
        telefono: schema.usuarios.telefono,
        edad: schema.usuarios.edad,
        sexo: schema.usuarios.sexo
      })
      .from(schema.usuarios)
      .where(eq(schema.usuarios.id, Number(id)))
      .limit(1);

    if (!psychologist) {
      res.status(404).json({ message: "Psicologo no encontrado" });
      return;
    }

    res.json(psychologist);
  } catch (error) {
    console.error("Error obteniendo psicologo:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/**
 * Update psychologist by id
 */
export const updatePsychologist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, correo, telefono, edad, ciudad } = req.body;

    const [updated] = await db
      .update(schema.usuarios)
      .set({
        nombres,
        apellidos,
        correo,
        telefono,
        edad,
        ciudad,
        updated_at: new Date()
      })
      .where(eq(schema.usuarios.id, Number(id)))
      .returning(); // devuelve el registro actualizado

    if (!updated) {
      res.status(404).json({ message: "Psicólogo no encontrado" });
      return;
    }

    // 🔑 Excluir contraseña antes de enviar respuesta
    const { contrasena, ...userSinContrasena } = updated;

    res.json(userSinContrasena);
  } catch (error) {
    console.error("Error actualizando psicólogo:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/**
 * Delete psychologist by id
 */
export const deletePsychologist = async (req: AuthRequest, res: Response): Promise<void> => {  
  const { id } = req.params;

  try {
    const result = await db
      .delete(schema.usuarios)
      .where(eq(schema.usuarios.id, Number(id)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ message: "Psicólogo no encontrado" });
      return;
    }

    res.json({ message: "Psicólogo eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando psicólogo:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};