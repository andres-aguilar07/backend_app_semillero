import { db } from './index';
import * as schema from './schema';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Check if data already exists to prevent duplicate seeding
    const existingPreguntas = await db.select().from(schema.preguntas).limit(1);
    
    if (existingPreguntas.length > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }
    
    // Create basic questions
    await db.insert(schema.preguntas).values([
      { texto: '¿Con qué frecuencia te has sentido triste últimamente?', peso: 2 },
      { texto: '¿Cómo calificarías tu nivel de estrés en este momento?', peso: 2 },
      { texto: '¿Has tenido dificultades para dormir?', peso: 1 },
      { texto: '¿Te has sentido sin energía o cansado/a sin razón aparente?', peso: 1 },
      { texto: '¿Has perdido interés en actividades que antes disfrutabas?', peso: 3 }
    ]);
    
    console.log('Added basic questions');
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await db.insert(schema.usuarios).values({
      correo: 'usuario@test.com',
      contrasena: hashedPassword,
      nombres: 'Usuario',
      apellidos: 'De Prueba',
      telefono: '1234567890',
      edad: 25,
      sexo: 'M'
    });
    
    console.log('Added test user');
    
    // Create test psychologist
    await db.insert(schema.psicologos).values({
      correo: 'psicologo@test.com',
      nombres: 'Psicólogo',
      apellidos: 'De Prueba',
      telefono: '0987654321',
      especialidad: 'Psicología clínica',
      activo: true
    });
    
    console.log('Added test psychologist');
    
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