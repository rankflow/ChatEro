import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/authService.js';

const prisma = new PrismaClient();

// Esquemas de validación
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(30)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Registro de usuario
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'username'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          username: { type: 'string', minLength: 3, maxLength: 30 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, username } = registerSchema.parse(request.body);
      
      // Registrar usuario con autenticación real
      const user = await AuthService.registerUser(email, password, username);
      
      if (!user) {
        return reply.status(400).send({
          success: false,
          message: 'Error al registrar usuario. El email o username ya está en uso.'
        });
      }
      
      const token = fastify.jwt.sign({ 
        userId: user.id,
        email: user.email,
        username: user.username
      });
      
      return reply.send({
        success: true,
        message: 'Usuario registrado exitosamente',
        token,
        user
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error en el registro',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Login de usuario
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);
      
      // Autenticar usuario con base de datos
      const user = await AuthService.loginUser(email, password);
      
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      const token = fastify.jwt.sign({ 
        userId: user.id,
        email: user.email,
        username: user.username
      });
      
      return reply.send({
        success: true,
        message: 'Login exitoso',
        token,
        user
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error en el login',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Verificar token
  fastify.get('/verify', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      message: 'Token válido',
      user: request.user
    });
  });

  // Obtener tokens del usuario
  fastify.get('/tokens', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      // Obtener tokens de la base de datos
      const tokenRecord = await prisma.token.findFirst({
        where: { userId }
      });
      
      const tokens = tokenRecord?.amount || 0;
      
      return reply.send({
        success: true,
        tokens
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error obteniendo tokens',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
} 