import { Router } from 'express';
import { authenticate, isPsicologo, isUsuario } from '../middleware/auth.middleware';
import { listRespuestas, getRespuestaById, createRespuesta, updateRespuestaPut, updateRespuestaPatch, deleteRespuesta } from '../controllers/encuestas-respuestas.controller';

const router = Router();

router.get('/', authenticate, listRespuestas);
router.get('/:id', authenticate, getRespuestaById);
router.post('/', authenticate, isUsuario, createRespuesta);
router.put('/:id', authenticate, updateRespuestaPut);
router.patch('/:id', authenticate, updateRespuestaPatch);
router.delete('/:id', authenticate, deleteRespuesta);

export default router;