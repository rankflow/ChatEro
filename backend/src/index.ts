import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar middleware
import { setupAuth } from './middleware/auth';

// Importar rutas
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import avatarRoutes from './routes/avatars';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Registrar plugins
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
});

await fastify.register(helmet);

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key'
});

await fastify.register(multipart);

// Configurar middleware de autenticación
setupAuth(fastify);

// Registrar rutas
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(chatRoutes, { prefix: '/api/chat' });
await fastify.register(avatarRoutes, { prefix: '/api/avatars' });
await fastify.register(paymentRoutes, { prefix: '/api/payments' });
await fastify.register(adminRoutes);

// Ruta de salud
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Ruta raíz
fastify.get('/', async (request, reply) => {
  return { 
    message: 'Chat IA + Avatares Eróticos API',
    version: '1.0.0',
    status: 'running'
  };
});

// Manejo de errores global
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      details: error.validation
    });
  }
  
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// Iniciar servidor
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port: Number(port), host });
    console.log(`🚀 Servidor corriendo en http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 