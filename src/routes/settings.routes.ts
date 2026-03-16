import { Router } from 'express';
import * as settingsController from "../controllers/settings.controller";
// Rutas para configuración y ajustes del usuario
const router = Router();
// Todas las rutas requieren autenticación
router.get("/profile", settingsController.getProfile);
router.put("/profile", settingsController.updateProfile);
// Rutas para preferencias (ej. idioma)
router.put("/preferences", settingsController.updatePreferences);
// Rutas para reportar problemas y enviar feedback
router.post("/report", settingsController.reportIssue);
router.post("/feedback", settingsController.sendFeedback);
// Rutas para obtener código de conducta, política de privacidad y términos
router.get("/code-of-conduct", settingsController.getCodeOfConduct);
router.get("/privacy-policy", settingsController.getPrivacyPolicy);
router.get("/terms", settingsController.getTerms);

export default router;