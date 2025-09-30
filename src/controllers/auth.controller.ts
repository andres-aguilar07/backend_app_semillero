import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../config/jwt';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { usuarios } from '../db/schema';

// Validation schemas
export const registerSchema = z.object({
  correo: z.string().email('Correo inválido'),
  contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  nombres: z.string().min(2, 'Nombre demasiado corto'),
  apellidos: z.string().min(2, 'Apellido demasiado corto'),
  telefono: z.string().min(7, 'Teléfono inválido'),
  ciudad: z.string().min(2, 'Ciudad demasiado corta'),
  edad: z.number().min(0, 'Edad inválida'),
  sexo: z.enum(['M', 'F']).optional(),
});

const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  contrasena: z.string(),
});

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errors: validationResult.error.errors
      });
      return;
    }

    const userData = validationResult.data;

    // Check if user already exists
    const existingUser = await db.select()
      .from(usuarios)
      .where(eq(usuarios.correo, userData.correo))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(400).json({ message: 'El correo ya está registrado' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);

    // Create user - aseguramos que todos los campos requeridos están explícitamente establecidos
    const [newUser] = await db.insert(usuarios)
      .values({
        correo: userData.correo,
        contrasena: hashedPassword,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        telefono: userData.telefono,
        edad: userData.edad,
        sexo: userData.sexo,
        id_rol: 3
      })
      .returning({
        id: usuarios.id,
        correo: usuarios.correo,
        nombres: usuarios.nombres,
        apellidos: usuarios.apellidos,
      });

    // Generate token
    const token = generateToken({
      id: newUser.id,
      correo: newUser.correo,
      role: 'usuario'
    });

    // Return user data and token
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser,
      token
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Login user or psychologist
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errors: validationResult.error.errors
      });
      return;
    }

    const { correo, contrasena } = validationResult.data;

    const results = await db.select()
      .from(usuarios)
      .where(eq(usuarios.correo, correo))
      .limit(1);

    if (results.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Contraseña incorrecta' });
      return;
    }

    let rol: 'admin' | 'psicologo' | 'usuario';

    switch (user.id_rol) {

      case 1: rol = "admin";
        break;

      case 2: rol = "psicologo";
        break;

      default: rol = "usuario";
    }

    // Generate token
    const token = generateToken({ id: user.id, correo: user.correo, role: rol });

    // Return user data and token
    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        correo: user.correo,
        nombres: user.nombres,
        apellidos: user.apellidos,
      },
      token
    });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 