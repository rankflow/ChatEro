import Stripe from 'stripe';
import { DatabaseService } from './database.js';

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class StripeService {
  /**
   * Crear un Payment Intent
   */
  static async createPaymentIntent(
    amount: number,
    currency: string,
    userId: string,
    metadata: any = {}
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          userId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creando Payment Intent:', error);
      return null;
    }
  }

  /**
   * Crear un Customer en Stripe
   */
  static async createCustomer(
    email: string,
    name: string,
    metadata: any = {}
  ): Promise<Stripe.Customer | null> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata
      });

      return customer;
    } catch (error) {
      console.error('Error creando Customer:', error);
      return null;
    }
  }

  /**
   * Crear una suscripción
   */
  static async createSubscription(
    customerId: string,
    priceId: string,
    metadata: any = {}
  ): Promise<Stripe.Subscription | null> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      console.error('Error creando Subscription:', error);
      return null;
    }
  }

  /**
   * Procesar webhook de Stripe
   */
  static async processWebhook(
    payload: string,
    signature: string,
    endpointSecret: string
  ): Promise<Stripe.Event | null> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );

      return event;
    } catch (error) {
      console.error('Error procesando webhook:', error);
      return null;
    }
  }

  /**
   * Manejar eventos de webhook
   */
  static async handleWebhookEvent(event: Stripe.Event): Promise<boolean> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        
        default:
          console.log(`Evento no manejado: ${event.type}`);
      }

      return true;
    } catch (error) {
      console.error('Error manejando evento de webhook:', error);
      return false;
    }
  }

  /**
   * Manejar Payment Intent exitoso
   */
  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount;
    const packageId = paymentIntent.metadata.packageId;

    if (!userId) {
      console.error('Payment Intent sin userId en metadata');
      return;
    }

    // Guardar pago en base de datos
    await DatabaseService.savePayment(
      userId,
      amount,
      paymentIntent.currency,
      'succeeded',
      paymentIntent.id,
      `Pago exitoso - ${packageId || 'Tokens'}`,
      paymentIntent.metadata
    );

    // Agregar tokens según el paquete
    if (packageId) {
      const tokensToAdd = this.getTokensForPackage(packageId);
      if (tokensToAdd > 0) {
        await DatabaseService.createOrUpdateTokens(userId, tokensToAdd);
        console.log(`✅ Agregados ${tokensToAdd} tokens para usuario ${userId}`);
      }
    }
  }

  /**
   * Manejar Payment Intent fallido
   */
  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const userId = paymentIntent.metadata.userId;

    if (!userId) {
      console.error('Payment Intent sin userId en metadata');
      return;
    }

    // Guardar pago fallido en base de datos
    await DatabaseService.savePayment(
      userId,
      paymentIntent.amount,
      paymentIntent.currency,
      'failed',
      paymentIntent.id,
      'Pago fallido',
      paymentIntent.metadata
    );
  }

  /**
   * Manejar suscripción creada
   */
  private static async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;

    if (!userId) {
      console.error('Subscription sin userId en metadata');
      return;
    }

    console.log(`✅ Suscripción creada para usuario ${userId}`);
  }

  /**
   * Manejar suscripción actualizada
   */
  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;

    if (!userId) {
      console.error('Subscription sin userId en metadata');
      return;
    }

    console.log(`🔄 Suscripción actualizada para usuario ${userId}`);
  }

  /**
   * Manejar suscripción eliminada
   */
  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;

    if (!userId) {
      console.error('Subscription sin userId en metadata');
      return;
    }

    console.log(`❌ Suscripción eliminada para usuario ${userId}`);
  }

  /**
   * Manejar factura pagada exitosamente
   */
  private static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const userId = subscription.metadata.userId;

      if (userId) {
        // Para suscripciones, agregar tokens ilimitados o renovar
        console.log(`✅ Factura pagada para suscripción de usuario ${userId}`);
      }
    }
  }

  /**
   * Manejar factura con pago fallido
   */
  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const userId = subscription.metadata.userId;

      if (userId) {
        console.log(`❌ Factura con pago fallido para usuario ${userId}`);
      }
    }
  }

  /**
   * Obtener tokens según el paquete
   */
  private static getTokensForPackage(packageId: string): number {
    const packageTokens: Record<string, number> = {
      'tokens_100': 100,
      'tokens_500': 500,
      'tokens_1000': 1000,
      'tokens_2000': 2000,
      'subscription_monthly': -1, // Ilimitado
      'subscription_yearly': -1   // Ilimitado
    };

    return packageTokens[packageId] || 0;
  }

  /**
   * Obtener precios de Stripe
   */
  static async getPrices(): Promise<Stripe.Price[]> {
    try {
      const prices = await stripe.prices.list({
        active: true,
        expand: ['data.product']
      });

      return prices.data;
    } catch (error) {
      console.error('Error obteniendo precios:', error);
      return [];
    }
  }

  /**
   * Crear precio en Stripe
   */
  static async createPrice(
    productId: string,
    amount: number,
    currency: string,
    recurring?: { interval: 'month' | 'year' }
  ): Promise<Stripe.Price | null> {
    try {
      const priceData: Stripe.PriceCreateParams = {
        product: productId,
        unit_amount: amount,
        currency,
      };

      if (recurring) {
        priceData.recurring = recurring;
      }

      const price = await stripe.prices.create(priceData);
      return price;
    } catch (error) {
      console.error('Error creando precio:', error);
      return null;
    }
  }

  /**
   * Crear producto en Stripe
   */
  static async createProduct(
    name: string,
    description: string,
    metadata: any = {}
  ): Promise<Stripe.Product | null> {
    try {
      const product = await stripe.products.create({
        name,
        description,
        metadata
      });

      return product;
    } catch (error) {
      console.error('Error creando producto:', error);
      return null;
    }
  }
} 