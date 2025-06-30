import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Esquemas de validación
const createPaymentIntentSchema = z.object({
  amount: z.number().min(100), // Mínimo 1.00
  currency: z.string().default('usd'),
  paymentMethod: z.enum(['tokens', 'subscription']),
  packageId: z.string().optional()
});

export default async function paymentRoutes(fastify: FastifyInstance) {
  // Crear intent de pago
  fastify.post('/create-intent', {
    schema: {
      body: {
        type: 'object',
        required: ['amount', 'paymentMethod'],
        properties: {
          amount: { type: 'number', minimum: 100 },
          currency: { type: 'string', default: 'usd' },
          paymentMethod: { type: 'string', enum: ['tokens', 'subscription'] },
          packageId: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { amount, currency, paymentMethod, packageId } = createPaymentIntentSchema.parse(request.body);
      const userId = request.user?.userId;
      
      // TODO: Implementar integración real con Stripe
      // Por ahora, simulamos la creación del intent
      
      const mockPaymentIntent = {
        id: `pi_${Date.now()}`,
        amount,
        currency,
        status: 'requires_payment_method',
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        payment_method_types: ['card'],
        metadata: {
          userId,
          paymentMethod,
          packageId
        }
      };
      
      return reply.send({
        success: true,
        paymentIntent: mockPaymentIntent
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error al crear intent de pago',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener paquetes disponibles
  fastify.get('/packages', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // TODO: Implementar obtención desde base de datos
      const mockPackages = [
        {
          id: 'tokens_100',
          name: '100 Tokens',
          description: '100 tokens para chat con IA',
          price: 999, // $9.99
          currency: 'usd',
          tokens: 100,
          type: 'tokens',
          isPopular: false
        },
        {
          id: 'tokens_500',
          name: '500 Tokens',
          description: '500 tokens para chat con IA',
          price: 3999, // $39.99
          currency: 'usd',
          tokens: 500,
          type: 'tokens',
          isPopular: true
        },
        {
          id: 'tokens_1000',
          name: '1000 Tokens',
          description: '1000 tokens para chat con IA',
          price: 6999, // $69.99
          currency: 'usd',
          tokens: 1000,
          type: 'tokens',
          isPopular: false
        },
        {
          id: 'subscription_monthly',
          name: 'Suscripción Mensual',
          description: 'Tokens ilimitados por mes',
          price: 1999, // $19.99
          currency: 'usd',
          tokens: -1, // Ilimitado
          type: 'subscription',
          isPopular: false
        },
        {
          id: 'subscription_yearly',
          name: 'Suscripción Anual',
          description: 'Tokens ilimitados por año (2 meses gratis)',
          price: 19999, // $199.99
          currency: 'usd',
          tokens: -1, // Ilimitado
          type: 'subscription',
          isPopular: false
        }
      ];
      
      return reply.send({
        success: true,
        packages: mockPackages
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener paquetes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Webhook de Stripe (para procesar pagos)
  fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // TODO: Implementar webhook real de Stripe
      // Por ahora, simulamos el procesamiento
      
      const body = request.body as any;
      fastify.log.info('Webhook recibido:', body);
      
      return reply.send({
        success: true,
        message: 'Webhook procesado'
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error en webhook',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener historial de pagos del usuario
  fastify.get('/history', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user?.userId;
      
      // TODO: Implementar obtención desde base de datos
      const mockHistory = [
        {
          id: 'pay_1',
          amount: 3999,
          currency: 'usd',
          status: 'succeeded',
          description: '500 Tokens',
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 día atrás
        },
        {
          id: 'pay_2',
          amount: 1999,
          currency: 'usd',
          status: 'succeeded',
          description: 'Suscripción Mensual',
          createdAt: new Date(Date.now() - 604800000).toISOString() // 1 semana atrás
        }
      ];
      
      return reply.send({
        success: true,
        payments: mockHistory
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener historial de pagos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
} 