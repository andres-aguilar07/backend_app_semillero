import { db } from './index';
import * as schema from './schema';
import bcrypt from 'bcrypt';

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
    const existingPreguntas = await db.select().from(schema.preguntas).limit(1);
    if (existingPreguntas.length === 0) {
      await db.insert(schema.preguntas).values([
        { texto: '¿Con qué frecuencia te has sentido triste últimamente?', peso: 2 },
        { texto: '¿Cómo calificarías tu nivel de estrés en este momento?', peso: 2 },
        { texto: '¿Has tenido dificultades para dormir?', peso: 1 },
        { texto: '¿Te has sentido sin energía o cansado/a sin razón aparente?', peso: 1 },
        { texto: '¿Has perdido interés en actividades que antes disfrutabas?', peso: 3 }
      ]);
      console.log('Added basic questions');
    } else {
      console.log('Questions already exist, skipping questions seed');
    }
    
    // Usuario de prueba (solo si no existe)
    const existingUser = await db.select().from(schema.usuarios).limit(1);
    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await db.insert(schema.usuarios).values({
        correo: 'usuario@test.com',
        contrasena: hashedPassword,
        nombres: 'Usuario',
        apellidos: 'De Prueba',
        telefono: '1234567890',
        edad: 25,
        sexo: 'M',
        id_rol: 3,
      });
      
      console.log('Added test user');
    } else {
      console.log('Users already exist, skipping test user seed');
    }
    
    // Nota: ya no se crean psicólogos, solo usuarios
    
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