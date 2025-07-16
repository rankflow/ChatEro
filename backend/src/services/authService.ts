import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { User } from '../types/index.js';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Registrar un nuevo usuario
   */
  static async registerUser(email: string, password: string, username: string): Promise<User | null> {
    try {
      // Verificar si el email ya existe
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        throw new Error('El email o username ya está en uso');
      }

      // Hashear la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear el usuario
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword
        }
      });

      // Crear tokens iniciales para el usuario
      await prisma.token.create({
        data: {
          userId: user.id,
          amount: 50 // Tokens iniciales gratuitos
        }
      });

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Error registrando usuario:', error);
      return null;
    }
  }

  /**
   * Autenticar usuario
   */
  static async loginUser(email: string, password: string): Promise<User | null> {
    try {
      // Buscar usuario por email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return null;
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  /**
   * Verificar si el email está disponible
   */
  static async isEmailAvailable(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      return !user;
    } catch (error) {
      console.error('Error verificando email:', error);
      return false;
    }
  }

  /**
   * Verificar si el username está disponible
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });
      return !user;
    } catch (error) {
      console.error('Error verificando username:', error);
      return false;
    }
  }
} 