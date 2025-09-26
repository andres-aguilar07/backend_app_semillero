import { Router } from 'express';
import { authenticate, isPsicologo } from '../middleware/auth.middleware';
import { listEncuestas, getEncuestaById, createEncuesta, updateEncuestaPut, updateEncuestaPatch, deleteEncuesta } from '../controllers/encuestas.controller';

const router = Router();

router.get('/', authenticate, isPsicologo, listEncuestas);
router.get('/:id', authenticate, isPsicologo, getEncuestaById);
router.post('/', authenticate, isPsicologo, createEncuesta);
router.put('/:id', authenticate, isPsicologo, updateEncuestaPut);
router.patch('/:id', authenticate, isPsicologo, updateEncuestaPatch);
router.delete('/:id', authenticate, isPsicologo, deleteEncuesta);

export default router;