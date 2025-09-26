import { Router } from 'express';
import { authenticate, isUsuario } from '../middleware/auth.middleware';
import { listRegistros, getRegistroById, createRegistro, updateRegistroPut, updateRegistroPatch, deleteRegistro } from '../controllers/registro-actividades.controller';

const router = Router();

router.get('/', authenticate, isUsuario, listRegistros);
router.get('/:id', authenticate, isUsuario, getRegistroById);
router.post('/', authenticate, isUsuario, createRegistro);
router.put('/:id', authenticate, isUsuario, updateRegistroPut);
router.patch('/:id', authenticate, isUsuario, updateRegistroPatch);
router.delete('/:id', authenticate, isUsuario, deleteRegistro);

export default router;