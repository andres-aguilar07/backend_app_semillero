import { Router } from 'express';
import { authenticate, isPsicologo } from '../middleware/auth.middleware';
import { listOpciones, getOpcionById, createOpcion, updateOpcionPut, updateOpcionPatch, deleteOpcion } from '../controllers/opciones-actividades.controller';

const router = Router();

router.get('/', authenticate, isPsicologo, listOpciones);
router.get('/:id', authenticate, isPsicologo, getOpcionById);
router.post('/', authenticate, isPsicologo, createOpcion);
router.put('/:id', authenticate, isPsicologo, updateOpcionPut);
router.patch('/:id', authenticate, isPsicologo, updateOpcionPatch);
router.delete('/:id', authenticate, isPsicologo, deleteOpcion);

export default router;