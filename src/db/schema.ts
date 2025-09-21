import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, integer, timestamp, boolean, text, date, index } from 'drizzle-orm/pg-core';

// ================================
// USUARIOS
// ================================

export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),

  id_rol: integer('id_rol')
    .references(() => roles.id, { onDelete: 'set null' }),

  nombres: varchar('nombres', { length: 255 }).notNull(),
  apellidos: varchar('apellidos', { length: 255 }).notNull(),

  correo: varchar('correo', { length: 255 }).unique().notNull(),
  contrasena: varchar('contrasena', { length: 255 }).notNull(),
  
  ciudad: varchar('ciudad', { length: 255 }),
  semestre_actual: varchar('semestre_actual', { length: 255 }),
  telefono: varchar('telefono', { length: 50 }),
  edad: integer('edad'),
  sexo: varchar('sexo', { length: 10 }),
  fecha_nacimiento: date('fecha_nacimiento'),

  idioma: varchar('idioma', { length: 255 }),

  especialidad_psicologo: varchar('especialidad_psicologo', { length: 255 }),

  fecha_registro: timestamp('fecha_registro').defaultNow().notNull(),

  is_active: boolean('is_active').default(true).notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxUsuariosIdRol: index('idx_usuarios_id_rol').on(t.id_rol),
}));

export const usuariosrelations = relations(usuarios, ({ one }) => ({
  rol: one(roles, {
    fields: [usuarios.id_rol],
    references: [roles.id],
  }),
}));

// ================================
// ROLES
// ================================

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),

  nombre: varchar('nombre', { length: 255 }).unique().notNull(),
  descripcion: text('descripcion'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

export const rolesrelations = relations(roles, ({ many }) => ({
  usuarios: many(usuarios),
}));

// ================================
// PREGUNTAS Y RESPUESTAS (ej: test personal diario)
// ================================
export const evaluaciones = pgTable('evaluaciones', {
  id: serial('id').primaryKey(),
  usuario_id: integer('usuario_id').references(() => usuarios.id, { onDelete: 'set null' }),
  fecha: timestamp('fecha').defaultNow().notNull(),
  puntaje_total: integer('puntaje_total'),
  estado_semaforo: varchar('estado_semaforo', { length: 50 }),
  observaciones: text('observaciones'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxEvaluacionesUsuarioId: index('idx_evaluaciones_usuario_id').on(t.usuario_id),
}));

export const evaluacionesrelations = relations(evaluaciones, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [evaluaciones.usuario_id],
    references: [usuarios.id],
  }),
}));

export const preguntas = pgTable('preguntas', {
  id: serial('id').primaryKey(),
  texto: text('texto').notNull(),
  peso: integer('peso').default(1).notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

export const preguntasrelations = relations(preguntas, ({ many }) => ({
  respuestas: many(respuestas),
}));

export const respuestas = pgTable('respuestas', {
  id: serial('id').primaryKey(),

  evaluacion_id: integer('evaluacion_id')
    .references(() => evaluaciones.id, { onDelete: 'set null' }),

  pregunta_id: integer('pregunta_id')
    .references(() => preguntas.id, { onDelete: 'set null' }),

  respuesta: integer('respuesta'),
  puntaje_calculado: integer('puntaje_calculado'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxRespuestasEvaluacionId: index('idx_respuestas_evaluacion_id').on(t.evaluacion_id),
  idxRespuestasPreguntaId: index('idx_respuestas_pregunta_id').on(t.pregunta_id),
}));

export const respuestasrelations = relations(respuestas, ({ one }) => ({
  pregunta: one(preguntas, {
    fields: [respuestas.pregunta_id],
    references: [preguntas.id],
  }),
  evaluacion: one(evaluaciones, {
    fields: [respuestas.evaluacion_id],
    references: [evaluaciones.id],
  }),
}));

export const evaluacionesRespuestasUsuarios = pgTable('evaluaciones_respuestas_usuarios', {
  id: serial('id').primaryKey(),

  usuario_id: integer('usuario_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),

  evaluacion_id: integer('evaluacion_id')
    .references(() => evaluaciones.id, { onDelete: 'set null' }),

  respuestas: text('respuestas'), // JSON con las respuestas de la evaluacion
  fecha: timestamp('fecha').defaultNow().notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxEvalRespUsuariosUsuarioId: index('idx_eval_resp_usuarios_usuario_id').on(t.usuario_id),
  idxEvalRespUsuariosEvaluacionId: index('idx_eval_resp_usuarios_evaluacion_id').on(t.evaluacion_id),
}));

export const evaluacionesRespuestasUsuariosrelations = relations(evaluacionesRespuestasUsuarios, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [evaluacionesRespuestasUsuarios.usuario_id],
    references: [usuarios.id],
  }),
  evaluacion: one(evaluaciones, {
    fields: [evaluacionesRespuestasUsuarios.evaluacion_id],
    references: [evaluaciones.id],
  }),
}));

// ================================
// ESTADISTICAS (cómo supiste de mí, ...)
// ================================

export const encuestas = pgTable('encuestas', {
  id: serial('id').primaryKey(),

  codigo: varchar('codigo', { length: 255 }).unique().notNull(),

  titulo: varchar('titulo', { length: 255 }).notNull(),
  opciones: text('opciones'), // JSON con las opciones de la encuesta

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

export const encuestasRespuestas = pgTable('encuestas_respuestas', {
  id: serial('id').primaryKey(),

  usuario_id: integer('usuario_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),

  encuesta_id: integer('encuesta_id')
    .references(() => encuestas.id, { onDelete: 'set null' }),

  respuesta: text('respuesta'), // JSON con la respuesta de la encuesta
  fecha: timestamp('fecha').defaultNow().notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxEncuestasRespuestasUsuarioId: index('idx_encuestas_respuestas_usuario_id').on(t.usuario_id),
  idxEncuestasRespuestasEncuestaId: index('idx_encuestas_respuestas_encuesta_id').on(t.encuesta_id),
}));

export const encuestasRespuestasrelations = relations(encuestasRespuestas, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [encuestasRespuestas.usuario_id],
    references: [usuarios.id],
  }),
  encuesta: one(encuestas, {
    fields: [encuestasRespuestas.encuesta_id],
    references: [encuestas.id],
  }),
}));


// ================================
// REGISTRO EMOCIONAL
// ================================

export const opciones_registro_emocional = pgTable('opciones_registro_emocional', {
  id: serial('id').primaryKey(),

  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),

  url_imagen: varchar('url_imagen', { length: 255 }).notNull(),

  puntaje: integer('puntaje').notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

export const registro_emocional = pgTable('registro_emocional', {
  id: serial('id').primaryKey(),

  usuario_id: integer('usuario_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),
  
  opcion_id: integer('opcion_id')
    .references(() => opciones_registro_emocional.id, { onDelete: 'set null' }),

  fecha: timestamp('fecha').defaultNow().notNull(),

  observaciones: text('observaciones'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxRegistroEmocionalUsuarioId: index('idx_registro_emocional_usuario_id').on(t.usuario_id),
  idxRegistroEmocionalOpcionId: index('idx_registro_emocional_opcion_id').on(t.opcion_id),
}));

export const registro_emocional_usuariosrelations = relations(registro_emocional, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [registro_emocional.usuario_id],
    references: [usuarios.id],
  }),
  opcion: one(opciones_registro_emocional, {
    fields: [registro_emocional.opcion_id],
    references: [opciones_registro_emocional.id],
  }),
}));

// ================================
// REGISTRO ACTIVIDADES
// ================================

export const opciones_registro_actividades = pgTable('opciones_registro_actividades', {
  id: serial('id').primaryKey(),

  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),

  url_imagen: varchar('url_imagen', { length: 255 }).notNull(),


  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

export const registro_actividades_usuarios = pgTable('registro_actividades_usuarios', {
  id: serial('id').primaryKey(),

  usuario_id: integer('usuario_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),

  opcion_id: integer('opcion_id')
    .references(() => opciones_registro_actividades.id, { onDelete: 'set null' }),

  vencimiento: timestamp('vencimiento').defaultNow().notNull(),
  fecha: timestamp('fecha').defaultNow().notNull(),

  observaciones: text('observaciones'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxRegistroActividadesUsuariosUsuarioId: index('idx_registro_actividades_usuarios_usuario_id').on(t.usuario_id),
  idxRegistroActividadesUsuariosOpcionId: index('idx_registro_actividades_usuarios_opcion_id').on(t.opcion_id),
}));

export const registro_actividades_usuariosrelations = relations(registro_actividades_usuarios, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [registro_actividades_usuarios.usuario_id],
    references: [usuarios.id],
  }),
  opcion: one(opciones_registro_actividades, {
    fields: [registro_actividades_usuarios.opcion_id],
    references: [opciones_registro_actividades.id],
  }),
}));

// ================================
// CHATS
// ================================
export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),

  estudiante_id: integer('estudiante_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),

  psicologo_id: integer('psicologo_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),

  iniciado_en: timestamp('iniciado_en').defaultNow().notNull(),
  ultima_actividad: timestamp('ultima_actividad').defaultNow().notNull(),
  finalizado_en: timestamp('finalizado_en'),
  
  is_active: boolean('is_active').default(true).notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxChatsEstudianteId: index('idx_chats_estudiante_id').on(t.estudiante_id),
  idxChatsPsicologoId: index('idx_chats_psicologo_id').on(t.psicologo_id),
}));

export const mensajes_chat = pgTable('mensajes_chat', {
  id: serial('id').primaryKey(),

  chat_id: integer('chat_id')
    .references(() => chats.id, { onDelete: 'set null' }),

  usuario_id: integer('usuario_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),

  mensaje: text('mensaje').notNull(),
  
  enviado_en: timestamp('enviado_en').defaultNow().notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxMensajesChatChatId: index('idx_mensajes_chat_chat_id').on(t.chat_id),
  idxMensajesChatUsuarioId: index('idx_mensajes_chat_usuario_id').on(t.usuario_id),
})); 

export const mensajes_chat_usuariosrelations = relations(mensajes_chat, ({ one }) => ({
  chat: one(chats, {
    fields: [mensajes_chat.chat_id],
    references: [chats.id],
  }),
  usuario: one(usuarios, {
    fields: [mensajes_chat.usuario_id],
    references: [usuarios.id],
  }),
}));

// ================================
// DIARIO
// ================================

export const diario = pgTable('diario', {
  id: serial('id').primaryKey(),

  usuario_id: integer('usuario_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),

  titulo: varchar('titulo', { length: 255 }).notNull(),
  contenido: text('contenido').notNull(),

  fecha: timestamp('fecha').defaultNow().notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxDiarioUsuarioId: index('idx_diario_usuario_id').on(t.usuario_id),
}));


// ================================
// FEEDBACK
// ================================

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),

  usuario_id: integer('usuario_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),

  puntaje: integer('puntaje').notNull(),
  que_mas_te_gusto: text('que_mas_te_gusto').notNull(),
  comentarios: text('comentarios'),

  fecha: timestamp('fecha').defaultNow().notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxFeedbackUsuarioId: index('idx_feedback_usuario_id').on(t.usuario_id),
}));

export const feedbackrelations = relations(feedback, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [feedback.usuario_id],
    references: [usuarios.id],
  }),
}));

// ================================
// FALLAS TECNICAS
// ================================

export const fallas_tecnicas = pgTable('fallas_tecnicas', {
  id: serial('id').primaryKey(),

  usuario_id: integer('usuario_id')
    .references(() => usuarios.id, { onDelete: 'set null' }),

  titulo: varchar('titulo', { length: 255 }).notNull(),
  descripcion: text('descripcion').notNull(),

  fecha: timestamp('fecha').defaultNow().notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (t) => ({
  idxFallasTecnicasUsuarioId: index('idx_fallas_tecnicas_usuario_id').on(t.usuario_id),
}));

export const fallas_tecnicasrelations = relations(fallas_tecnicas, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [fallas_tecnicas.usuario_id],
    references: [usuarios.id],
  }),
}));

// ================================
// TEXTO APLICACIÓN
// ================================

// TERMINOS Y CONDICIONES, PRIVACIDAD, CODIGO DE CONDUCTA, etc.

export const texto_aplicacion = pgTable('texto_aplicacion', {
  id: serial('id').primaryKey(),

  codigo: varchar('codigo', { length: 255 }).unique().notNull(),
  
  titulo: varchar('titulo', { length: 255 }).notNull(),
  texto: text('texto').notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});