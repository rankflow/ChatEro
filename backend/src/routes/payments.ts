import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { DatabaseService } from '../services/database.js';
import { StripeService } from '../services/stripeService.js';

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
      const userId = (request.user as any)?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Crear Payment Intent real con Stripe
      const paymentIntent = await StripeService.createPaymentIntent(
        amount,
        currency,
        userId,
        {
          paymentMethod,
          packageId
        }
      );

      if (!paymentIntent) {
        return reply.status(500).send({
          success: false,
          message: 'Error al crear intent de pago'
        });
      }
      
      return reply.send({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret,
          payment_method_types: paymentIntent.payment_method_types,
          metadata: paymentIntent.metadata
        }
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
      // Intentar obtener precios desde Stripe
      const stripePrices = await StripeService.getPrices();
      
      // Si no hay precios en Stripe, usar paquetes por defecto
      const packages = stripePrices.length > 0 ? 
        stripePrices.map(price => ({
          id: price.id,
          name: (price.product as any)?.name || 'Paquete de Tokens',
          description: (price.product as any)?.description || 'Tokens para chat con IA',
          price: price.unit_amount || 0,
          currency: price.currency,
          tokens: price.metadata?.tokens ? parseInt(price.metadata.tokens) : 100,
          type: price.recurring ? 'subscription' : 'tokens',
          isPopular: false
        })) : [
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
        packages
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
      const signature = request.headers['stripe-signature'] as string;
      const payload = JSON.stringify(request.body);
      
      if (!signature) {
        return reply.status(400).send({
          success: false,
          message: 'Falta signature de Stripe'
        });
      }

      // Procesar webhook con Stripe
      const event = await StripeService.processWebhook(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      if (!event) {
        return reply.status(400).send({
          success: false,
          message: 'Webhook inválido'
        });
      }

      // Manejar el evento
      await StripeService.handleWebhookEvent(event);
      
      return reply.send({
        success: true,
        message: 'Webhook procesado correctamente'
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
      const userId = (request.user as any)?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      // Obtener historial real desde base de datos
      const payments = await DatabaseService.getPaymentHistory(userId);
      
      return reply.send({
        success: true,
        payments
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

  // Crear suscripción
  fastify.post('/create-subscription', {
    schema: {
      body: {
        type: 'object',
        required: ['priceId'],
        properties: {
          priceId: { type: 'string' },
          customerId: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { priceId, customerId } = request.body as any;
      const userId = (request.user as any)?.userId;
      
      if (!userId) {
        return reply.status(401).send({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Crear suscripción en Stripe
      const subscription = await StripeService.createSubscription(
        customerId,
        priceId,
        { userId }
      );

      if (!subscription) {
        return reply.status(500).send({
          success: false,
          message: 'Error al crear suscripción'
        });
      }

      return reply.send({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          latest_invoice: subscription.latest_invoice
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error al crear suscripción',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener información del cliente
  fastify.get('/customer-info', {
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

      // Obtener información del usuario para crear/obtener customer
      const user = await DatabaseService.getUserById(userId);
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Crear customer en Stripe si no existe
      const customer = await StripeService.createCustomer(
        user.email,
        user.username,
        { userId }
      );

      if (!customer) {
        return reply.status(500).send({
          success: false,
          message: 'Error al obtener información del cliente'
        });
      }

      return reply.send({
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener información del cliente',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
} 