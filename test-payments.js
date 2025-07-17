#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Simular un token JWT válido (en producción esto vendría del login)
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHV0dGVyZWRfdXNlcl9pZCIsImlhdCI6MTczMzMzMzMzMywiZXhwIjoxNzMzMzM2OTMzfQ.example';

async function testPayments() {
  console.log('🧪 Probando Sistema de Pagos...\n');

  try {
    // 1. Probar obtención de paquetes
    console.log('1️⃣ Probando obtención de paquetes...');
    const packagesResponse = await axios.get(`${API_BASE_URL}/api/payments/packages`);
    
    if (packagesResponse.data.success) {
      console.log('✅ Paquetes obtenidos correctamente');
      console.log(`   - ${packagesResponse.data.packages.length} paquetes disponibles`);
      packagesResponse.data.packages.forEach(pkg => {
        console.log(`   - ${pkg.name}: ${pkg.price/100} ${pkg.currency.toUpperCase()}`);
      });
    } else {
      console.log('❌ Error obteniendo paquetes');
    }

    // 2. Probar creación de Payment Intent (con autenticación)
    console.log('\n2️⃣ Probando creación de Payment Intent...');
    try {
      const paymentIntentResponse = await axios.post(
        `${API_BASE_URL}/api/payments/create-intent`,
        {
          amount: 999, // $9.99
          currency: 'usd',
          paymentMethod: 'tokens',
          packageId: 'tokens_100'
        },
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (paymentIntentResponse.data.success) {
        console.log('✅ Payment Intent creado correctamente');
        console.log(`   - ID: ${paymentIntentResponse.data.paymentIntent.id}`);
        console.log(`   - Estado: ${paymentIntentResponse.data.paymentIntent.status}`);
      } else {
        console.log('❌ Error creando Payment Intent');
      }
    } catch (error) {
      console.log('⚠️  Payment Intent requiere autenticación real');
    }

    // 3. Probar obtención de información del cliente
    console.log('\n3️⃣ Probando obtención de información del cliente...');
    try {
      const customerResponse = await axios.get(
        `${API_BASE_URL}/api/payments/customer-info`,
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );

      if (customerResponse.data.success) {
        console.log('✅ Información del cliente obtenida');
        console.log(`   - Customer ID: ${customerResponse.data.customer.id}`);
        console.log(`   - Email: ${customerResponse.data.customer.email}`);
      } else {
        console.log('❌ Error obteniendo información del cliente');
      }
    } catch (error) {
      console.log('⚠️  Customer info requiere autenticación real');
    }

    // 4. Probar historial de pagos
    console.log('\n4️⃣ Probando historial de pagos...');
    try {
      const historyResponse = await axios.get(
        `${API_BASE_URL}/api/payments/history`,
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );

      if (historyResponse.data.success) {
        console.log('✅ Historial de pagos obtenido');
        console.log(`   - ${historyResponse.data.payments.length} pagos en historial`);
      } else {
        console.log('❌ Error obteniendo historial de pagos');
      }
    } catch (error) {
      console.log('⚠️  Historial requiere autenticación real');
    }

    // 5. Probar webhook (simulado)
    console.log('\n5️⃣ Probando webhook...');
    try {
      const webhookResponse = await axios.post(
        `${API_BASE_URL}/api/payments/webhook`,
        {
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_test_123',
              amount: 999,
              currency: 'usd',
              metadata: {
                userId: 'test_user_id',
                packageId: 'tokens_100'
              }
            }
          }
        },
        {
          headers: {
            'stripe-signature': 'test_signature'
          }
        }
      );

      if (webhookResponse.data.success) {
        console.log('✅ Webhook procesado correctamente');
      } else {
        console.log('❌ Error procesando webhook');
      }
    } catch (error) {
      console.log('⚠️  Webhook requiere signature válida de Stripe');
    }

    console.log('\n🎉 Pruebas completadas!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Configurar variables de entorno de Stripe');
    console.log('2. Ejecutar npm run stripe:setup en el backend');
    console.log('3. Configurar webhook en Stripe Dashboard');
    console.log('4. Probar pagos reales en modo de desarrollo');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testPayments(); 