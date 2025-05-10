import { Router } from 'express';
import * as psicologoController from '../controllers/psicologo.controller';

const router = Router();

/**
 * @route GET /api/psicologos
 * @desc Get all active psychologists
 * @access Public
 */
router.get('/', psicologoController.getPsicologos);

export default router; 