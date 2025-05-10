import { Router } from 'express';
import * as evaluacionController from '../controllers/evaluacion.controller';
import { authenticate, isUsuario } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/evaluaciones/preguntas
 * @desc Get all questions for evaluation
 * @access Public
 */
router.get('/preguntas', evaluacionController.getPreguntas);

export default router; 