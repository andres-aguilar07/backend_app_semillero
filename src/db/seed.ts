import { db } from './index';
import * as schema from './schema';
import { inArray } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Seed de roles (idempotente). Se ejecuta siempre para garantizar integridad referencial.
    const rolesToSeed = [
      { id: 1, nombre: 'admin', descripcion: 'Administrador de la plataforma' },
      { id: 2, nombre: 'psicologo', descripcion: 'Profesional de psicología' },
      { id: 3, nombre: 'usuario', descripcion: 'Usuario general de la aplicación' },
      { id: 4, nombre: 'moderador', descripcion: 'Moderador de contenidos y soporte' },
      { id: 5, nombre: 'invitado', descripcion: 'Acceso limitado de solo consulta' },
    ];

    await db.insert(schema.roles)
      .values(rolesToSeed)
      .onConflictDoNothing({ target: schema.roles.id });

    console.log('Roles seeded successfully');
    
    // Preguntas base (solo si no existen)
    const preguntasBase = [
      '¿Cómo describirías tu estado de ánimo general durante la última semana?',
      '¿Has experimentado dificultades para dormir en los últimos días?',
      '¿Te has sentido capaz de concentrarte en tus actividades diarias?',
    ];

    const preguntasExistentes = await db
      .select({
        id: schema.preguntas_registro_emocional.id,
        texto: schema.preguntas_registro_emocional.texto,
      })
      .from(schema.preguntas_registro_emocional)
      .where(inArray(schema.preguntas_registro_emocional.texto, preguntasBase));

    if (preguntasExistentes.length === 0) {
      await db.insert(schema.preguntas_registro_emocional).values(
        preguntasBase.map((texto) => ({
          texto,
          is_active: true,
        }))
      );
    }

    const preguntasCreadas = await db
      .select({
        id: schema.preguntas_registro_emocional.id,
        texto: schema.preguntas_registro_emocional.texto,
      })
      .from(schema.preguntas_registro_emocional)
      .where(inArray(schema.preguntas_registro_emocional.texto, preguntasBase));

    const preguntasPorTexto = new Map(preguntasCreadas.map((p) => [p.texto, p.id]));

    const opcionesBaseExistentes = await db
      .select({ id: schema.opciones_registro_emocional.id })
      .from(schema.opciones_registro_emocional)
      .limit(1);

    if (opcionesBaseExistentes.length === 0) {
      const opcionesRegistroEmocionalBase = [
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[0])!,
          nombre: 'Muy positivo',
          descripcion: 'Te sentiste con energía y bienestar casi toda la semana',
          url_imagen: '/images/registro-emocional/muy-positivo.png',
          puntaje: 0,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[0])!,
          nombre: 'Generalmente positivo',
          descripcion: 'Predominó una sensación de bienestar con momentos normales',
          url_imagen: '/images/registro-emocional/generalmente-positivo.png',
          puntaje: 1,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[0])!,
          nombre: 'Neutral',
          descripcion: 'Tu estado emocional fue estable, sin cambios marcados',
          url_imagen: '/images/registro-emocional/neutral.png',
          puntaje: 2,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[0])!,
          nombre: 'Algo negativo',
          descripcion: 'Hubo varios momentos de malestar o desánimo',
          url_imagen: '/images/registro-emocional/algo-negativo.png',
          puntaje: 3,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[0])!,
          nombre: 'Muy negativo',
          descripcion: 'Predominó una sensación de malestar durante la semana',
          url_imagen: '/images/registro-emocional/muy-negativo.png',
          puntaje: 5,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[1])!,
          nombre: 'No, duermo perfectamente',
          descripcion: 'Descansas bien y no presentas interrupciones relevantes',
          url_imagen: '/images/registro-emocional/dormir-sin-problemas.png',
          puntaje: 0,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[1])!,
          nombre: 'Ocasionalmente',
          descripcion: 'Aparecen dificultades de sueño de forma esporádica',
          url_imagen: '/images/registro-emocional/dormir-ocasionalmente.png',
          puntaje: 1,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[1])!,
          nombre: 'Con cierta frecuencia',
          descripcion: 'El sueño se ha visto alterado en varias noches recientes',
          url_imagen: '/images/registro-emocional/dormir-frecuente.png',
          puntaje: 2,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[1])!,
          nombre: 'Casi todas las noches',
          descripcion: 'Las dificultades para dormir son casi diarias',
          url_imagen: '/images/registro-emocional/dormir-casi-siempre.png',
          puntaje: 4,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[1])!,
          nombre: 'Todas las noches',
          descripcion: 'Presentas problemas de sueño de forma constante',
          url_imagen: '/images/registro-emocional/dormir-todas-las-noches.png',
          puntaje: 5,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[2])!,
          nombre: 'Sí, sin problemas',
          descripcion: 'Mantienes la atención de forma adecuada en tus tareas',
          url_imagen: '/images/registro-emocional/concentracion-sin-problemas.png',
          puntaje: 0,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[2])!,
          nombre: 'Generalmente sí',
          descripcion: 'Te concentras bien la mayor parte del tiempo',
          url_imagen: '/images/registro-emocional/concentracion-generalmente-si.png',
          puntaje: 1,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[2])!,
          nombre: 'A veces tengo dificultades',
          descripcion: 'Tu capacidad de enfoque varía según el día o actividad',
          url_imagen: '/images/registro-emocional/concentracion-a-veces.png',
          puntaje: 2,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[2])!,
          nombre: 'Frecuentemente me cuesta',
          descripcion: 'Con frecuencia te cuesta mantener la atención',
          url_imagen: '/images/registro-emocional/concentracion-frecuente.png',
          puntaje: 4,
          is_active: true,
        },
        {
          pregunta_id: preguntasPorTexto.get(preguntasBase[2])!,
          nombre: 'No logro concentrarme',
          descripcion: 'Tu dificultad para concentrarte es persistente',
          url_imagen: '/images/registro-emocional/concentracion-no-logro.png',
          puntaje: 5,
          is_active: true,
        },
      ];

      await db.insert(schema.opciones_registro_emocional).values(opcionesRegistroEmocionalBase);
      console.log('Preguntas y opciones de registro emocional seeded successfully');
    } else {
      console.log('Preguntas y opciones de registro emocional ya existen');
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// If this file is run directly (not imported), run seed
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

export { seed }; 