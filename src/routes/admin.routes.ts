import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/admin/addPsychologist
 * @desc Get authenticated user profile
 * @access Private
 */
router.post("/addPsychologist", authenticate, isAdmin, adminController.registerPsychologist);

/**
 * @route GET /api/admin/count
 * @desc Get authenticated user profile
 * @access Private
 */
router.get("/count", authenticate, isAdmin, adminController.countUsuarios);

/**
 * @route GET /api/admin/students
 * @desc Get authenticated user profile
 * @access Private
 */
router.get("/students", authenticate, isAdmin, adminController.getStudents);

/**
 * @route GET /api/admin/students/:id
 * @desc Get authenticated user profile
 * @access Private
 */
router.get("/students/:id", authenticate, isAdmin, adminController.getStudentById);

/**
 * @route GET /api/admin/psychologists
 * @desc Get authenticated user profile
 * @access Private
 */
router.get("/psychologists", authenticate, isAdmin, adminController.getPsychologists);

/**
 * @route GET /api/admin/psychologists/:id
 * @desc Get authenticated user profile
 * @access Private
 */
router.get("/psychologists/:id", authenticate, isAdmin, adminController.getPsychologistById);

/**
 * @route PUT /api/admin/psychologists/:id
 * @desc Get authenticated user profile
 * @access Private
 */
router.put("/psychologists/:id", authenticate, isAdmin, adminController.updatePsychologist);

/**
 * @route DELETE /api/admin/psychologists/:id
 * @desc Get authenticated user profile
 * @access Private
 */
router.delete("/psychologists/:id", authenticate, isAdmin, adminController.deletePsychologist);

export default router;