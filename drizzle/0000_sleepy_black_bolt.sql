CREATE TABLE IF NOT EXISTS "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"psicologo_id" integer,
	"iniciado_en" timestamp DEFAULT now() NOT NULL,
	"ultima_actividad" timestamp DEFAULT now() NOT NULL,
	"finalizado_en" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diario" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"titulo" varchar(255) NOT NULL,
	"contenido" text NOT NULL,
	"fecha" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "encuestas" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" varchar(255) NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"opciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "encuestas_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "encuestas_respuestas" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"encuesta_id" integer,
	"respuesta" text,
	"fecha" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evaluaciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"fecha" timestamp DEFAULT now() NOT NULL,
	"puntaje_total" integer,
	"estado_semaforo" varchar(50),
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evaluaciones_respuestas_usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"evaluacion_id" integer,
	"respuestas" text,
	"fecha" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fallas_tecnicas" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"titulo" varchar(255) NOT NULL,
	"descripcion" text NOT NULL,
	"fecha" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"puntaje" integer NOT NULL,
	"que_mas_te_gusto" text NOT NULL,
	"comentarios" text,
	"fecha" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mensajes_chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer,
	"usuario_id" integer,
	"mensaje" text NOT NULL,
	"enviado_en" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opciones_registro_actividades" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"descripcion" text,
	"url_imagen" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opciones_registro_emocional" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"descripcion" text,
	"url_imagen" varchar(255) NOT NULL,
	"puntaje" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preguntas" (
	"id" serial PRIMARY KEY NOT NULL,
	"texto" text NOT NULL,
	"peso" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "registro_actividades_usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"opcion_id" integer,
	"vencimiento" timestamp DEFAULT now() NOT NULL,
	"fecha" timestamp DEFAULT now() NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "registro_emocional" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"opcion_id" integer,
	"fecha" timestamp DEFAULT now() NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "respuestas" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluacion_id" integer,
	"pregunta_id" integer,
	"respuesta" integer,
	"puntaje_calculado" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"descripcion" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "roles_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "texto_aplicacion" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" varchar(255) NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"texto" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "texto_aplicacion_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_rol" integer,
	"nombres" varchar(255) NOT NULL,
	"apellidos" varchar(255) NOT NULL,
	"correo" varchar(255) NOT NULL,
	"contrasena" varchar(255) NOT NULL,
	"ciudad" varchar(255),
	"semestre_actual" varchar(255),
	"telefono" varchar(50),
	"edad" integer,
	"sexo" varchar(10),
	"fecha_nacimiento" date,
	"idioma" varchar(255),
	"especialidad_psicologo" varchar(255),
	"fecha_registro" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "usuarios_correo_unique" UNIQUE("correo")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chats_estudiante_id" ON "chats" ("estudiante_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chats_psicologo_id" ON "chats" ("psicologo_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_diario_usuario_id" ON "diario" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_encuestas_respuestas_usuario_id" ON "encuestas_respuestas" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_encuestas_respuestas_encuesta_id" ON "encuestas_respuestas" ("encuesta_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_evaluaciones_usuario_id" ON "evaluaciones" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_eval_resp_usuarios_usuario_id" ON "evaluaciones_respuestas_usuarios" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_eval_resp_usuarios_evaluacion_id" ON "evaluaciones_respuestas_usuarios" ("evaluacion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fallas_tecnicas_usuario_id" ON "fallas_tecnicas" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_usuario_id" ON "feedback" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mensajes_chat_chat_id" ON "mensajes_chat" ("chat_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mensajes_chat_usuario_id" ON "mensajes_chat" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_registro_actividades_usuarios_usuario_id" ON "registro_actividades_usuarios" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_registro_actividades_usuarios_opcion_id" ON "registro_actividades_usuarios" ("opcion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_registro_emocional_usuario_id" ON "registro_emocional" ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_registro_emocional_opcion_id" ON "registro_emocional" ("opcion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_respuestas_evaluacion_id" ON "respuestas" ("evaluacion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_respuestas_pregunta_id" ON "respuestas" ("pregunta_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_usuarios_id_rol" ON "usuarios" ("id_rol");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_psicologo_id_usuarios_id_fk" FOREIGN KEY ("psicologo_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diario" ADD CONSTRAINT "diario_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encuestas_respuestas" ADD CONSTRAINT "encuestas_respuestas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encuestas_respuestas" ADD CONSTRAINT "encuestas_respuestas_encuesta_id_encuestas_id_fk" FOREIGN KEY ("encuesta_id") REFERENCES "encuestas"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluaciones_respuestas_usuarios" ADD CONSTRAINT "evaluaciones_respuestas_usuarios_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluaciones_respuestas_usuarios" ADD CONSTRAINT "evaluaciones_respuestas_usuarios_evaluacion_id_evaluaciones_id_fk" FOREIGN KEY ("evaluacion_id") REFERENCES "evaluaciones"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fallas_tecnicas" ADD CONSTRAINT "fallas_tecnicas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mensajes_chat" ADD CONSTRAINT "mensajes_chat_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mensajes_chat" ADD CONSTRAINT "mensajes_chat_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registro_actividades_usuarios" ADD CONSTRAINT "registro_actividades_usuarios_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registro_actividades_usuarios" ADD CONSTRAINT "registro_actividades_usuarios_opcion_id_opciones_registro_actividades_id_fk" FOREIGN KEY ("opcion_id") REFERENCES "opciones_registro_actividades"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registro_emocional" ADD CONSTRAINT "registro_emocional_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registro_emocional" ADD CONSTRAINT "registro_emocional_opcion_id_opciones_registro_emocional_id_fk" FOREIGN KEY ("opcion_id") REFERENCES "opciones_registro_emocional"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_evaluacion_id_evaluaciones_id_fk" FOREIGN KEY ("evaluacion_id") REFERENCES "evaluaciones"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_pregunta_id_preguntas_id_fk" FOREIGN KEY ("pregunta_id") REFERENCES "preguntas"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_roles_id_fk" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
