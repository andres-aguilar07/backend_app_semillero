CREATE TABLE IF NOT EXISTS "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"psicologo_id" integer NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"activo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contactos_psicologos" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"psicologo_id" integer NOT NULL,
	"fecha_contacto" timestamp DEFAULT now() NOT NULL,
	"motivo" text,
	"resultado" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evaluaciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"fecha" timestamp DEFAULT now() NOT NULL,
	"puntaje_total" integer,
	"estado_semaforo" varchar(50),
	"observaciones" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mensajes_chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"emisor_tipo" varchar(50) NOT NULL,
	"emisor_id" integer NOT NULL,
	"mensaje" text NOT NULL,
	"enviado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preguntas" (
	"id" serial PRIMARY KEY NOT NULL,
	"texto" text NOT NULL,
	"peso" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "psicologos" (
	"id" serial PRIMARY KEY NOT NULL,
	"correo" varchar(255) NOT NULL,
	"nombres" varchar(255) NOT NULL,
	"apellidos" varchar(255) NOT NULL,
	"telefono" varchar(50),
	"especialidad" varchar(255),
	"activo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "psicologos_correo_unique" UNIQUE("correo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "respuestas" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluacion_id" integer NOT NULL,
	"pregunta_id" integer NOT NULL,
	"respuesta" integer,
	"puntaje_calculado" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"correo" varchar(255) NOT NULL,
	"contrasena" varchar(255) NOT NULL,
	"nombres" varchar(255) NOT NULL,
	"apellidos" varchar(255) NOT NULL,
	"telefono" varchar(50),
	"edad" integer,
	"sexo" char(1),
	"fecha_registro" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_correo_unique" UNIQUE("correo")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_psicologo_id_psicologos_id_fk" FOREIGN KEY ("psicologo_id") REFERENCES "psicologos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contactos_psicologos" ADD CONSTRAINT "contactos_psicologos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contactos_psicologos" ADD CONSTRAINT "contactos_psicologos_psicologo_id_psicologos_id_fk" FOREIGN KEY ("psicologo_id") REFERENCES "psicologos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mensajes_chat" ADD CONSTRAINT "mensajes_chat_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_evaluacion_id_evaluaciones_id_fk" FOREIGN KEY ("evaluacion_id") REFERENCES "evaluaciones"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_pregunta_id_preguntas_id_fk" FOREIGN KEY ("pregunta_id") REFERENCES "preguntas"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
