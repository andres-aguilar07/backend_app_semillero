import { Router } from 'express';
import { authenticate, isUsuario } from '../middleware/auth.middleware';
import {
  validateGetRespuestasUsuarioPorFecha,
  validateSaveRespuestasRegistroEmocional,
} from '../middleware/registro-emocional.middleware';
import {
  getPreguntasRegistroEmocional,
  getRespuestasUsuarioPorFecha,
  saveRespuestasRegistroEmocional,
} from '../controllers/registro-emocional.controller';

const router = Router();

router.get('/preguntas', authenticate, isUsuario, getPreguntasRegistroEmocional);

router.get(
  '/usuarios/:usuarioId/fecha/:fecha',
  authenticate,
  isUsuario,
  validateGetRespuestasUsuarioPorFecha,
  getRespuestasUsuarioPorFecha,
);

router.post('/', authenticate, isUsuario, validateSaveRespuestasRegistroEmocional, saveRespuestasRegistroEmocional);

export default router;
