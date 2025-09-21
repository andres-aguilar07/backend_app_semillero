import { Request, Response } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.middleware';
import { analizarRespuestasOllama } from '../services/ollama.service';
import { db } from '../db';
import * as schema from '../db/schema';

// Validation schema for evaluation responses
const evaluacionSchema = z.object({
  respuestas: z.array(
    z.object({
      pregunta_id: z.number(),
      respuesta: z.number().min(1).max(5),
    })
  ),
  observaciones: z.string().optional(),
});

/**
 * Get all available questions for evaluations
 */
export const getPreguntas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const preguntas = await db.select().from(schema.preguntas);
    res.json(preguntas);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Create a new evaluation with AI analysis
 */
export const crearEvaluacion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Validate request body
    const validationResult = evaluacionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Datos inválidos', 
        errors: validationResult.error.errors 
      });
      return;
    }

    const { respuestas, observaciones } = validationResult.data;

    // Get questions for analysis
    const preguntas = await db.select().from(schema.preguntas);

    // Ensure respuestas have the correct type
    const respuestasTyped = respuestas as { pregunta_id: number; respuesta: number; }[];

    let analisisResult;

    try {
      console.log('Usando Ollama para análisis...');
      analisisResult = await analizarRespuestasOllama(preguntas, respuestasTyped);
    } catch (aiError) {
      console.error('Error en análisis IA:', aiError);
      
      // Fallback calculation
      const rawScore = respuestasTyped.reduce((sum, resp) => {
        const pregunta = preguntas.find(p => p.id === resp.pregunta_id);
        return sum + (resp.respuesta * (pregunta?.peso || 1));
      }, 0);

      analisisResult = {
        estado: rawScore > 40 ? 'rojo' : rawScore > 25 ? 'amarillo' : 'verde',
        puntaje: Math.min(rawScore * 2, 100),
        observaciones: 'Evaluación realizada con sistema de respaldo debido a error en el análisis IA',
        recomendaciones: [
          'Mantén rutinas saludables de sueño y ejercicio',
          'Busca apoyo en familiares y amigos cercanos',
          'Considera hablar con un profesional si persisten las molestias'
        ]
      };
    }

    // Create evaluation in database (map to schema)
    const observacionesTexto = [
      analisisResult.observaciones,
      observaciones ? `Observaciones usuario: ${observaciones}` : null,
    ].filter(Boolean).join(' | ');

    const [nuevaEvaluacion] = await db.insert(schema.evaluaciones)
      .values({
        usuario_id: req.user.id,
        puntaje_total: analisisResult.puntaje,
        estado_semaforo: analisisResult.estado,
        observaciones: observacionesTexto,
      })
      .returning();

    // Insert respuestas asociadas
    const pesoPorPregunta = new Map(preguntas.map(p => [p.id, p.peso]));
    const respuestasAInsertar = respuestasTyped.map((r) => ({
      evaluacion_id: nuevaEvaluacion.id,
      pregunta_id: r.pregunta_id,
      respuesta: r.respuesta,
      puntaje_calculado: r.respuesta * (pesoPorPregunta.get(r.pregunta_id) || 1),
    }));

    if (respuestasAInsertar.length > 0) {
      await db.insert(schema.respuestas).values(respuestasAInsertar);
    }

    res.status(201).json({
      message: 'Evaluación creada exitosamente',
      evaluacion: nuevaEvaluacion,
      analisis: analisisResult
    });

  } catch (error) {
    console.error('Error creating evaluation:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Get user evaluations
 */
export const getEvaluaciones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const evaluaciones = await db
      .select()
      .from(schema.evaluaciones)
      .where(eq(schema.evaluaciones.usuario_id, req.user.id as number))
      .orderBy(desc(schema.evaluaciones.fecha));

    res.json(evaluaciones);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Get specific evaluation by ID
 */
export const getEvaluacion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const evaluacionId = parseInt(req.params.id);
    
    if (isNaN(evaluacionId)) {
      res.status(400).json({ message: 'ID de evaluación inválido' });
      return;
    }

    const [evaluacion] = await db
      .select()
      .from(schema.evaluaciones)
      .where(eq(schema.evaluaciones.id, evaluacionId))
      .limit(1);

    if (!evaluacion) {
      res.status(404).json({ message: 'Evaluación no encontrada' });
      return;
    }

    // Check if evaluation belongs to user
    if (evaluacion.usuario_id !== req.user.id) {
      res.status(403).json({ message: 'No tienes acceso a esta evaluación' });
      return;
    }

    res.json(evaluacion);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 