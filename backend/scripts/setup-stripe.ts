import { StripeService } from '../src/services/stripeService.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupStripe() {
  console.log('🔄 Configurando productos y precios en Stripe...');

  try {
    // 1. Crear productos
    console.log('📦 Creando productos...');
    
    const products = [
      {
        name: '100 Tokens',
        description: '100 tokens para chat con IA',
        metadata: { tokens: '100', type: 'tokens' }
      },
      {
        name: '500 Tokens',
        description: '500 tokens para chat con IA',
        metadata: { tokens: '500', type: 'tokens' }
      },
      {
        name: '1000 Tokens',
        description: '1000 tokens para chat con IA',
        metadata: { tokens: '1000', type: 'tokens' }
      },
      {
        name: '2000 Tokens',
        description: '2000 tokens para chat con IA',
        metadata: { tokens: '2000', type: 'tokens' }
      },
      {
        name: 'Suscripción Mensual',
        description: 'Tokens ilimitados por mes',
        metadata: { tokens: '-1', type: 'subscription' }
      },
      {
        name: 'Suscripción Anual',
        description: 'Tokens ilimitados por año (2 meses gratis)',
        metadata: { tokens: '-1', type: 'subscription' }
      }
    ];

    const createdProducts: any[] = [];
    
    for (const productData of products) {
      const product = await StripeService.createProduct(
        productData.name,
        productData.description,
        productData.metadata
      );
      
      if (product) {
        createdProducts.push(product);
        console.log(`✅ Producto creado: ${product.name} (${product.id})`);
      } else {
        console.log(`❌ Error creando producto: ${productData.name}`);
      }
    }

    // 2. Crear precios
    console.log('💰 Creando precios...');
    
    const prices = [
      {
        productId: createdProducts[0]?.id, // 100 Tokens
        amount: 999, // $9.99
        currency: 'usd'
      },
      {
        productId: createdProducts[1]?.id, // 500 Tokens
        amount: 3999, // $39.99
        currency: 'usd'
      },
      {
        productId: createdProducts[2]?.id, // 1000 Tokens
        amount: 6999, // $69.99
        currency: 'usd'
      },
      {
        productId: createdProducts[3]?.id, // 2000 Tokens
        amount: 12999, // $129.99
        currency: 'usd'
      },
      {
        productId: createdProducts[4]?.id, // Suscripción Mensual
        amount: 1999, // $19.99
        currency: 'usd',
        recurring: { interval: 'month' as const }
      },
      {
        productId: createdProducts[5]?.id, // Suscripción Anual
        amount: 19999, // $199.99
        currency: 'usd',
        recurring: { interval: 'year' as const }
      }
    ];

    for (const priceData of prices) {
      if (!priceData.productId) {
        console.log('❌ Producto no encontrado para crear precio');
        continue;
      }

      const price = await StripeService.createPrice(
        priceData.productId,
        priceData.amount,
        priceData.currency,
        priceData.recurring
      );
      
      if (price) {
        console.log(`✅ Precio creado: ${price.unit_amount} ${price.currency} (${price.id})`);
      } else {
        console.log(`❌ Error creando precio para producto ${priceData.productId}`);
      }
    }

    console.log('✅ Configuración de Stripe completada');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Configurar webhook en Stripe Dashboard');
    console.log('2. Copiar el webhook secret a las variables de entorno');
    console.log('3. Probar los pagos en modo de desarrollo');

  } catch (error) {
    console.error('❌ Error configurando Stripe:', error);
  }
}

setupStripe(); 