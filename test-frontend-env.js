#!/usr/bin/env node

/**
 * Script para verificar las variables de entorno del frontend
 * Ejecutar: node test-frontend-env.js
 */

const https = require('https');

console.log('🔍 Verificando variables de entorno del frontend...\n');

// Función para hacer requests HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testFrontendEnvironment() {
  console.log('1️⃣ Verificando respuesta del frontend...');
  
  try {
    const response = await makeRequest('https://chat-ero-1.vercel.app');
    
    if (response.status === 200) {
      console.log('   ✅ Frontend responde correctamente');
      
      // Buscar referencias a la API en el HTML
      if (response.data.includes('localhost:3001')) {
        console.log('   ⚠️  Frontend usando localhost (variables no configuradas)');
      } else if (response.data.includes('chat-ero-production.up.railway.app')) {
        console.log('   ✅ Frontend usando Railway (variables configuradas)');
      } else {
        console.log('   ❓ No se puede determinar la URL de la API desde el HTML');
      }
    } else {
      console.log(`   ❌ Frontend no responde (Status: ${response.status})`);
    }
  } catch (error) {
    console.log(`   ❌ Error conectando al frontend: ${error.message}`);
  }
}

async function testBackendCORS() {
  console.log('\n2️⃣ Verificando CORS del backend...');
  
  try {
    const response = await makeRequest('https://chat-ero-production.up.railway.app/health');
    
    if (response.status === 200) {
      console.log('   ✅ Backend responde correctamente');
    } else {
      console.log(`   ❌ Backend no responde (Status: ${response.status})`);
    }
  } catch (error) {
    console.log(`   ❌ Error conectando al backend: ${error.message}`);
  }
}

function showInstructions() {
  console.log('\n3️⃣ Instrucciones para configurar variables:');
  console.log('\n   📋 Variables necesarias en Vercel:');
  console.log('      NEXT_PUBLIC_API_URL = https://chat-ero-production.up.railway.app');
  console.log('      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_... (tu clave de Stripe)');
  
  console.log('\n   🔗 Enlaces:');
  console.log('      Vercel Dashboard: https://vercel.com/dashboard');
  console.log('      Railway Dashboard: https://railway.app/dashboard');
  
  console.log('\n   ⚠️  IMPORTANTE:');
  console.log('      - Después de configurar variables, haz redeploy en Vercel');
  console.log('      - Las variables NEXT_PUBLIC_* se inyectan durante el build');
  console.log('      - Si no ves los cambios, espera unos minutos');
}

async function runTests() {
  await testFrontendEnvironment();
  await testBackendCORS();
  showInstructions();
  
  console.log('\n🎯 Próximos pasos:');
  console.log('   1. Configurar variables en Vercel Dashboard');
  console.log('   2. Hacer redeploy del frontend');
  console.log('   3. Probar login con credenciales correctas');
  console.log('   4. Verificar que el CORS funciona');
}

runTests().catch(console.error); 