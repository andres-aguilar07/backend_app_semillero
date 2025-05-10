import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../config/jwt';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  correo: z.string().email('Correo inválido'),
  contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  nombres: z.string().min(2, 'Nombre demasiado corto'),
  apellidos: z.string().min(2, 'Apellido demasiado corto'),
  telefono: z.string().optional(),
  edad: z.number().optional(),
  sexo: z.enum(['M', 'F']).optional(),
});

const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  contrasena: z.string(),
  tipo: z.enum(['usuario', 'psicologo']),
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
    const existingUser = await prisma.usuario.findUnique({
      where: { correo: userData.correo }
    });
    
    if (existingUser) {
      res.status(400).json({ message: 'El correo ya está registrado' });
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);
    
    // Create user
    const newUser = await prisma.usuario.create({
      data: {
        ...userData,
        contrasena: hashedPassword,
      }
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
      user: {
        id: newUser.id,
        correo: newUser.correo,
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
      },
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
    
    const { correo, contrasena, tipo } = validationResult.data;
    
    // Check if the user is a regular user or a psychologist
    let user;
    
    if (tipo === 'usuario') {
      user = await prisma.usuario.findUnique({
        where: { correo }
      });
    } else {
      user = await prisma.psicologo.findUnique({
        where: { correo }
      });
      
      if (user && !user.activo) {
        res.status(403).json({ message: 'Cuenta desactivada' });
        return;
      }
    }
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // For psychologists, we don't have passwords in the current schema
    // This would need to be modified in a real implementation
    if (tipo === 'psicologo') {
      // In a real application, psychologists would also have passwords
      // This is just a placeholder for the prototype
      const token = generateToken({
        id: user.id,
        correo: user.correo,
        role: 'psicologo'
      });
      
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
      return;
    }
    
    // Check password for regular users
    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
    
    if (!passwordMatch) {
      res.status(401).json({ message: 'Contraseña incorrecta' });
      return;
    }
    
    // Generate token
    const token = generateToken({
      id: user.id,
      correo: user.correo,
      role: tipo
    });
    
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