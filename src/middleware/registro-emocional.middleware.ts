import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from './auth.middleware';
import { APIErrorResponse } from '../shared/utils/api.utils';

const fechaRegex = /^\d{2}-\d{2}-\d{4}$/;

const getByDateParamsSchema = z.object({
  usuarioId: z.coerce.number().int().positive(),
  fecha: z.string().regex(fechaRegex, 'Formato de fecha inválido. Usa DD-MM-YYYY'),
});

const saveRespuestasBodySchema = z.object({
  usuario_id: z.number().int().positive(),
  respuestas: z
    .array(
      z.object({
        pregunta_id: z.number().int().positive(),
        opcion_id: z.number().int().positive(),
      }),
    )
    .min(1, 'Debes enviar al menos una respuesta')
    .superRefine((items, ctx) => {
      const seen = new Set<number>();
      for (const [index, item] of items.entries()) {
        if (seen.has(item.pregunta_id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La pregunta ${item.pregunta_id} está repetida en respuestas`,
            path: [index, 'pregunta_id'],
          });
        }
        seen.add(item.pregunta_id);
      }
    }),
});

export const validateGetRespuestasUsuarioPorFecha = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const parsed = getByDateParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json(APIErrorResponse('Parámetros inválidos', parsed.error.errors.map((e) => e.message)));
    return;
  }

  if (req.user?.id && req.user.id !== parsed.data.usuarioId) {
    res.status(403).json(APIErrorResponse('No puedes consultar registros de otro usuario'));
    return;
  }

  next();
};

export const validateSaveRespuestasRegistroEmocional = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const parsed = saveRespuestasBodySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(APIErrorResponse('Body inválido', parsed.error.errors.map((e) => e.message)));
    return;
  }

  if (req.user?.id && req.user.id !== parsed.data.usuario_id) {
    res.status(403).json(APIErrorResponse('No puedes guardar registros para otro usuario'));
    return;
  }

  next();
};
