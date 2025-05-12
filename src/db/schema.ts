import { pgTable, serial, varchar, integer, timestamp, boolean, text, foreignKey, char } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  correo: varchar('correo', { length: 255 }).unique().notNull(),
  contrasena: varchar('contrasena', { length: 255 }).notNull(),
  nombres: varchar('nombres', { length: 255 }).notNull(),
  apellidos: varchar('apellidos', { length: 255 }).notNull(),
  telefono: varchar('telefono', { length: 50 }),
  edad: integer('edad'),
  sexo: char('sexo', { length: 1 }),
  fecha_registro: timestamp('fecha_registro').defaultNow().notNull()
});

export const psicologos = pgTable('psicologos', {
  id: serial('id').primaryKey(),
  correo: varchar('correo', { length: 255 }).unique().notNull(),
  nombres: varchar('nombres', { length: 255 }).notNull(),
  apellidos: varchar('apellidos', { length: 255 }).notNull(),
  telefono: varchar('telefono', { length: 50 }),
  especialidad: varchar('especialidad', { length: 255 }),
  activo: boolean('activo').default(true).notNull()
});

export const preguntas = pgTable('preguntas', {
  id: serial('id').primaryKey(),
  texto: text('texto').notNull(),
  peso: integer('peso').default(1).notNull()
});

export const evaluaciones = pgTable('evaluaciones', {
  id: serial('id').primaryKey(),
  usuario_id: integer('usuario_id').notNull().references(() => usuarios.id),
  fecha: timestamp('fecha').defaultNow().notNull(),
  puntaje_total: integer('puntaje_total'),
  estado_semaforo: varchar('estado_semaforo', { length: 50 }),
  observaciones: text('observaciones')
});

export const respuestas = pgTable('respuestas', {
  id: serial('id').primaryKey(),
  evaluacion_id: integer('evaluacion_id')
    .notNull()
    .references(() => evaluaciones.id, { onDelete: 'cascade' }),
  pregunta_id: integer('pregunta_id')
    .notNull()
    .references(() => preguntas.id),
  respuesta: integer('respuesta'),
  puntaje_calculado: integer('puntaje_calculado')
});

export const contactos_psicologos = pgTable('contactos_psicologos', {
  id: serial('id').primaryKey(),
  usuario_id: integer('usuario_id')
    .notNull()
    .references(() => usuarios.id),
  psicologo_id: integer('psicologo_id')
    .notNull()
    .references(() => psicologos.id),
  fecha_contacto: timestamp('fecha_contacto').defaultNow().notNull(),
  motivo: text('motivo'),
  resultado: text('resultado')
});

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  usuario_id: integer('usuario_id')
    .notNull()
    .references(() => usuarios.id),
  psicologo_id: integer('psicologo_id')
    .notNull()
    .references(() => psicologos.id),
  creado_en: timestamp('creado_en').defaultNow().notNull(),
  activo: boolean('activo').default(true).notNull()
});

export const mensajes_chat = pgTable('mensajes_chat', {
  id: serial('id').primaryKey(),
  chat_id: integer('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  emisor_tipo: varchar('emisor_tipo', { length: 50 }).notNull(),
  emisor_id: integer('emisor_id').notNull(),
  mensaje: text('mensaje').notNull(),
  enviado_en: timestamp('enviado_en').defaultNow().notNull()
}); 