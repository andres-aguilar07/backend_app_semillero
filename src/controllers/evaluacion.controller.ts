import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { analizarRespuestas } from '../services/openai.service';
import { analizarRespuestasOllama } from '../services/ollama.service';
import { dbAdapter } from '../db/drizzle-adapter';

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
    const preguntas = await dbAdapter.preguntas.findMany();
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
    const preguntas = await dbAdapter.preguntas.findMany();

    // Ensure respuestas have the correct type
    const respuestasTyped = respuestas as { pregunta_id: number; respuesta: number; }[];

    let analisisResult;
    const useOllama = process.env.USE_OLLAMA === 'true';

    try {
      
      if (useOllama) {
        console.log('Usando Ollama para análisis...');
        analisisResult = await analizarRespuestasOllama(preguntas, respuestasTyped);
      } else {
        console.log('Usando OpenAI para análisis...');
        analisisResult = await analizarRespuestas(preguntas, respuestasTyped);
      }
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

    // Create evaluation in database
    const nuevaEvaluacion = await dbAdapter.evaluaciones.create({
      data: {
        usuario_id: req.user.id,
        estado: analisisResult.estado,
        puntaje: analisisResult.puntaje,
        observaciones_ia: analisisResult.observaciones,
        recomendaciones: analisisResult.recomendaciones,
        observaciones_usuario: observaciones || null,
        respuestas: respuestasTyped
      }
    });

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

    const evaluaciones = await dbAdapter.evaluaciones.findMany({
      where: {
        usuario_id: req.user.id
      }
    });

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

    const evaluacion = await dbAdapter.evaluaciones.findUnique({
      where: {
        id: evaluacionId
      }
    });

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