import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { analizarRespuestas } from '../services/openai.service';

const prisma = new PrismaClient();

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
    const preguntas = await prisma.pregunta.findMany();
    res.json(preguntas);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 