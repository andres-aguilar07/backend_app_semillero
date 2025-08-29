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

/**
 * @route POST /api/evaluaciones
 * @desc Create a new evaluation
 * @access Private (Users only)
 */
router.post('/', authenticate, isUsuario, evaluacionController.crearEvaluacion);

/**
 * @route GET /api/evaluaciones
 * @desc Get all evaluations for the authenticated user
 * @access Private (Users only)
 */
router.get('/', authenticate, isUsuario, evaluacionController.getEvaluaciones);

/**
 * @route GET /api/evaluaciones/:id
 * @desc Get specific evaluation by ID
 * @access Private (Users only)
 */
router.get('/:id', authenticate, isUsuario, evaluacionController.getEvaluacion);

export default router; 