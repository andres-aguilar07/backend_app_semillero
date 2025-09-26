import { Router } from 'express';
import { authenticate, isUsuario } from '../middleware/auth.middleware';
import { listDiario, getDiarioById, createDiario, updateDiarioPut, updateDiarioPatch, deleteDiario } from '../controllers/diario.controller';

const router = Router();

router.get('/', authenticate, isUsuario, listDiario);
router.get('/:id', authenticate, isUsuario, getDiarioById);
router.post('/', authenticate, isUsuario, createDiario);
router.put('/:id', authenticate, isUsuario, updateDiarioPut);
router.patch('/:id', authenticate, isUsuario, updateDiarioPatch);
router.delete('/:id', authenticate, isUsuario, deleteDiario);

export default router;