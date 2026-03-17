import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import { db } from "../db";
import * as schema from "../db/schema";

import { eq } from "drizzle-orm";
import { z } from "zod";

// Esquema de validación para actualizar perfil
const updateProfileSchema = z.object({
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  telefono: z.string().optional(),
  semestre_actual: z.string().optional(),
  fecha_nacimiento: z.string().optional()
});
// Esquema para enviar el feedback
const sendFeedbackSchema = z.object({
  puntaje: z.number().min(1).max(5),
  que_mas_te_gusto: z.string().min(1),
  comentarios: z.string().optional()
});
// Esquema para enviar un reporte de problema
const sendReportSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().min(1)
});
//esquema para actualiza las preferencias (idioma)
const updatePreferencesSchema = z.object({
  idioma: z.enum(["es", "en", "pt", "fr", "de"])
});

// Obtener perfil del usuario
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    const [user] = await db
      .select()
      .from(schema.usuarios)
      .where(eq(schema.usuarios.id, userId))
      .limit(1);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar perfil del usuario
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.errors });
      return;
    }
    const data = parsed.data;
    const [existing] = await db
      .select()
      .from(schema.usuarios)
      .where(eq(schema.usuarios.id, userId))
      .limit(1);
    if (!existing) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    const [updated] = await db
      .update(schema.usuarios)
      .set({
        nombres: data.nombres,
        apellidos: data.apellidos,
        telefono: data.telefono,
        semestre_actual: data.semestre_actual,
        fecha_nacimiento: data.fecha_nacimiento,
        updated_at: new Date()
      })
      .where(eq(schema.usuarios.id, userId))
      .returning({
        id: schema.usuarios.id,
        nombres: schema.usuarios.nombres,
        apellidos: schema.usuarios.apellidos,
        correo: schema.usuarios.correo
      });
    res.json(updated);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
// Actualizar preferencias del usuario (idioma)
export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Usuario no autenticado"
      });
      return;
    }

    const parsed = updatePreferencesSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.errors
      });
      return;
    }

    const { idioma } = parsed.data;

    const [updatedUser] = await db
      .update(schema.usuarios)
      .set({
        idioma
      })
      .where(eq(schema.usuarios.id, userId))
      .returning({
        idioma: schema.usuarios.idioma
      });

    res.status(200).json({
      message: "Preferencias actualizadas correctamente",
      preferences: updatedUser
    });

  } catch (error) {

    console.error("Error updating preferences:", error);

    res.status(500).json({
      message: "Error en el servidor"
    });

  }
};


// Reportar un problema
export const reportIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Usuario no autenticado"
      });
      return;
    }

    const parsed = sendReportSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.errors
      });
      return;
    }

    const data = parsed.data;

    const [newReport] = await db
      .insert(schema.fallas_tecnicas)
      .values({
        usuario_id: userId,
        titulo: data.titulo,
        descripcion: data.descripcion
      })
      .returning();

    res.status(201).json({
      message: "Problema reportado correctamente",
      report: newReport
    });

  } catch (error) {

    console.error("Error reporting issue:", error);

    res.status(500).json({
      message: "Error en el servidor"
    });

  }
};
// Enviar feedback
export const sendFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Usuario no autenticado"
      });
      return;
    }
    const parsed = sendFeedbackSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.errors
      });
      return;
    }
    const data = parsed.data;
    const [newFeedback] = await db
      .insert(schema.feedback)
      .values({
        usuario_id: userId,
        puntaje: data.puntaje,
        que_mas_te_gusto: data.que_mas_te_gusto,
        comentarios: data.comentarios
      })
      .returning();
    res.status(201).json({
      message: "Feedback enviado correctamente",
      feedback: newFeedback
    });

  } catch (error) {

    console.error("Error sending feedback:", error);

    res.status(500).json({
      message: "Error en el servidor"
    });

  }
};



// Obtener código de conducta, política de privacidad y términos
export const getCodeOfConduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const result = await db
      .select()
      .from(schema.texto_aplicacion)
      .where(eq(schema.texto_aplicacion.codigo, "code_of_conduct"))
      .limit(1);

    if (result.length === 0) {
      res.status(404).json({
        message: "Código de conducta no encontrado"
      });
      return;
    }

    res.status(200).json(result[0]);

  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo código de conducta",
      error
    });
  }
};

export const getPrivacyPolicy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const result = await db
      .select()
      .from(schema.texto_aplicacion)
      .where(eq(schema.texto_aplicacion.codigo, "privacy_policy"))
      .limit(1);

    if (result.length === 0) {
      res.status(404).json({
        message: "Política de privacidad no encontrada"
      });
      return;
    }

    res.status(200).json(result[0]);

  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo política de privacidad",
      error
    });
  }
};

export const getTerms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const result = await db
      .select()
      .from(schema.texto_aplicacion)
      .where(eq(schema.texto_aplicacion.codigo, "terms"))
      .limit(1);

    if (result.length === 0) {
      res.status(404).json({
        message: "Términos y condiciones no encontrados"
      });
      return;
    }

    res.status(200).json(result[0]);

  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo términos y condiciones",
      error
    });
  }
};