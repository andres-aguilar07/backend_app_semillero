import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.mensajeChat.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.contactoPsicologo.deleteMany();
  await prisma.respuesta.deleteMany();
  await prisma.evaluacion.deleteMany();
  await prisma.pregunta.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.psicologo.deleteMany();

  // Crear preguntas de evaluación
  const preguntas = await Promise.all([
    prisma.pregunta.create({
      data: {
        texto: '¿Con qué frecuencia te has sentido triste o deprimido/a en las últimas 2 semanas?',
        peso: 3,
      },
    }),
    prisma.pregunta.create({
      data: {
        texto: '¿Has experimentado pérdida de interés en actividades que solías disfrutar?',
        peso: 3,
      },
    }),
    prisma.pregunta.create({
      data: {
        texto: '¿Has tenido problemas para dormir o duermes en exceso?',
        peso: 2,
      },
    }),
    prisma.pregunta.create({
      data: {
        texto: '¿Te has sentido cansado/a o con poca energía?',
        peso: 2,
      },
    }),
    prisma.pregunta.create({
      data: {
        texto: '¿Has tenido dificultad para concentrarte en tareas diarias?',
        peso: 2,
      },
    }),
    prisma.pregunta.create({
      data: {
        texto: '¿Te has sentido mal contigo mismo/a o has pensado que eres un fracaso?',
        peso: 4,
      },
    }),
    prisma.pregunta.create({
      data: {
        texto: '¿Has pensado que estarías mejor muerto/a o has tenido pensamientos de hacerte daño?',
        peso: 5,
      },
    }),
    prisma.pregunta.create({
      data: {
        texto: '¿Te sientes nervioso/a, ansioso/a o con los nervios de punta?',
        peso: 3,
      },
    }),
    prisma.pregunta.create({
      data: {
        texto: '¿Sientes que no puedes dejar de preocuparte o que te preocupas demasiado?',
        peso: 3,
      },
    }),
    prisma.pregunta.create({
      data: {
        texto: '¿Te sientes apoyado/a por tu entorno social y familiar?',
        peso: 2,
      },
    }),
  ]);

  console.log('Preguntas creadas:', preguntas.length);

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('Contrasena123', 10);
  
  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        correo: 'usuario1@example.com',
        contrasena: hashedPassword,
        nombres: 'Juan',
        apellidos: 'Pérez',
        telefono: '3001234567',
        edad: 28,
        sexo: 'M',
      },
    }),
    prisma.usuario.create({
      data: {
        correo: 'usuario2@example.com',
        contrasena: hashedPassword,
        nombres: 'María',
        apellidos: 'Gómez',
        telefono: '3101234567',
        edad: 32,
        sexo: 'F',
      },
    }),
    prisma.usuario.create({
      data: {
        correo: 'usuario3@example.com',
        contrasena: hashedPassword,
        nombres: 'Carlos',
        apellidos: 'Rodríguez',
        telefono: '3201234567',
        edad: 24,
        sexo: 'M',
      },
    }),
  ]);

  console.log('Usuarios creados:', usuarios.length);

  // Crear psicólogos
  const psicologos = await Promise.all([
    prisma.psicologo.create({
      data: {
        correo: 'psicologo1@example.com',
        nombres: 'Ana',
        apellidos: 'Martínez',
        telefono: '3001234568',
        especialidad: 'Terapia Cognitivo-Conductual',
      },
    }),
    prisma.psicologo.create({
      data: {
        correo: 'psicologo2@example.com',
        nombres: 'Roberto',
        apellidos: 'Torres',
        telefono: '3101234568',
        especialidad: 'Psicología Clínica',
      },
    }),
  ]);

  console.log('Psicólogos creados:', psicologos.length);

  // Crear evaluaciones y respuestas
  // Usuario 1 - Estado verde (buen estado mental)
  const evaluacionUsuario1 = await prisma.evaluacion.create({
    data: {
      usuario_id: usuarios[0].id,
      puntaje_total: 15,
      estado_semaforo: 'verde',
      observaciones: 'Estado mental óptimo',
    },
  });

  // Usuario 2 - Estado amarillo (alerta moderada)
  const evaluacionUsuario2 = await prisma.evaluacion.create({
    data: {
      usuario_id: usuarios[1].id,
      puntaje_total: 25,
      estado_semaforo: 'amarillo',
      observaciones: 'Se recomienda observación y seguimiento',
    },
  });

  // Usuario 3 - Estado rojo (alerta grave)
  const evaluacionUsuario3 = await prisma.evaluacion.create({
    data: {
      usuario_id: usuarios[2].id,
      puntaje_total: 40,
      estado_semaforo: 'rojo',
      observaciones: 'Se recomienda intervención psicológica inmediata',
    },
  });

  // Crear respuestas para las evaluaciones
  // Se crean respuestas simuladas para cada pregunta en cada evaluación
  for (const pregunta of preguntas) {
    // Usuario 1 - Respuestas bajas (buen estado mental)
    await prisma.respuesta.create({
      data: {
        evaluacion_id: evaluacionUsuario1.id,
        pregunta_id: pregunta.id,
        respuesta: Math.floor(Math.random() * 2) + 1, // Valores entre 1-2
        puntaje_calculado: pregunta.peso * (Math.floor(Math.random() * 2) + 1),
      },
    });

    // Usuario 2 - Respuestas moderadas
    await prisma.respuesta.create({
      data: {
        evaluacion_id: evaluacionUsuario2.id,
        pregunta_id: pregunta.id,
        respuesta: Math.floor(Math.random() * 2) + 2, // Valores entre 2-3
        puntaje_calculado: pregunta.peso * (Math.floor(Math.random() * 2) + 2),
      },
    });

    // Usuario 3 - Respuestas altas (mal estado mental)
    await prisma.respuesta.create({
      data: {
        evaluacion_id: evaluacionUsuario3.id,
        pregunta_id: pregunta.id,
        respuesta: Math.floor(Math.random() * 2) + 4, // Valores entre 4-5
        puntaje_calculado: pregunta.peso * (Math.floor(Math.random() * 2) + 4),
      },
    });
  }

  console.log('Evaluaciones y respuestas creadas');

  // Crear contacto con psicólogo para usuario en estado rojo
  const contacto = await prisma.contactoPsicologo.create({
    data: {
      usuario_id: usuarios[2].id,
      psicologo_id: psicologos[0].id,
      motivo: 'Alerta por evaluación en rojo',
      resultado: 'Pendiente',
    },
  });

  console.log('Contacto con psicólogo creado');

  // Crear chat entre usuario y psicólogo
  const chat = await prisma.chat.create({
    data: {
      usuario_id: usuarios[2].id,
      psicologo_id: psicologos[0].id,
    },
  });

  // Crear mensajes en el chat
  const mensajes = await Promise.all([
    prisma.mensajeChat.create({
      data: {
        chat_id: chat.id,
        emisor_tipo: 'usuario',
        emisor_id: usuarios[2].id,
        mensaje: 'Hola, me gustaría agendar una consulta.',
      },
    }),
    prisma.mensajeChat.create({
      data: {
        chat_id: chat.id,
        emisor_tipo: 'psicologo',
        emisor_id: psicologos[0].id,
        mensaje: 'Hola Carlos, claro que sí. ¿Te parece bien mañana a las 10am?',
      },
    }),
    prisma.mensajeChat.create({
      data: {
        chat_id: chat.id,
        emisor_tipo: 'usuario',
        emisor_id: usuarios[2].id,
        mensaje: 'Perfecto, muchas gracias.',
      },
    }),
  ]);

  console.log('Chat y mensajes creados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 