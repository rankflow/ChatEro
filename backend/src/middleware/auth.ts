import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Extender el tipo de request para incluir el usuario
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      username: string;
    };
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }
    
    const decoded = request.server.jwt.verify(token);
    request.user = decoded as any;
    
  } catch (error) {
    return reply.status(401).send({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
}

export function setupAuth(fastify: FastifyInstance) {
  // Registrar el middleware de autenticación
  fastify.decorate('authenticate', authenticate);
} 