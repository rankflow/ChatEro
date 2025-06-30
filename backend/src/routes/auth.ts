import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

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
      
      // TODO: Implementar lógica de registro con base de datos
      // Por ahora, simulamos el registro
      
      const token = fastify.jwt.sign({ 
        userId: 'temp-user-id',
        email,
        username 
      });
      
      return reply.send({
        success: true,
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: 'temp-user-id',
          email,
          username
        }
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
      
      // TODO: Implementar lógica de login con base de datos
      // Por ahora, simulamos el login
      
      const token = fastify.jwt.sign({ 
        userId: 'temp-user-id',
        email,
        username: 'usuario_temp'
      });
      
      return reply.send({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          id: 'temp-user-id',
          email,
          username: 'usuario_temp'
        }
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
} 