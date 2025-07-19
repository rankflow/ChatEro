#!/usr/bin/env node

/**
 * Script para probar la conexión completa entre frontend y backend
 * Ejecutar: node test-conexion-completa.js
 */

const https = require('https');

// URLs de los servicios (configurables por variables de entorno)
const BACKEND_URL = process.env.BACKEND_URL || 'https://chat-ero-production.up.railway.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://chat-ero-1.vercel.app';

console.log('🧪 Probando conexión completa Chat Ero...\n');

// Función para hacer requests HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test 1: Verificar que el backend responde
async function testBackend() {
  console.log('1️⃣ Probando backend...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });

    console.log(`   ✅ Backend responde (Status: ${response.status})`);
    console.log(`   📍 URL: ${BACKEND_URL}`);
    
    if (response.status === 401) {
      console.log('   ℹ️  Respuesta esperada: credenciales inválidas');
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error conectando al backend: ${error.message}`);
    return false;
  }
}

// Test 2: Verificar que el frontend responde
async function testFrontend() {
  console.log('\n2️⃣ Probando frontend...');
  try {
    const response = await makeRequest(FRONTEND_URL);
    
    console.log(`   ✅ Frontend responde (Status: ${response.status})`);
    console.log(`   📍 URL: ${FRONTEND_URL}`);
    
    if (response.status === 200) {
      console.log('   ✅ Página cargando correctamente');
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error conectando al frontend: ${error.message}`);
    return false;
  }
}

// Test 3: Verificar endpoints específicos del backend
async function testBackendEndpoints() {
  console.log('\n3️⃣ Probando endpoints específicos...');
  
  const endpoints = [
    '/api/auth/login',
    '/api/auth/register', 
    '/api/avatars',
    '/api/chat/message',
    '/api/payments/packages'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`   ✅ ${endpoint} (Status: ${response.status})`);
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Test 4: Verificar variables de entorno necesarias
function checkEnvironmentVariables() {
  console.log('\n4️⃣ Variables de entorno necesarias:');
  
  const requiredVars = {
    'NEXT_PUBLIC_API_URL': process.env.BACKEND_URL || 'https://chat-ero-production.up.railway.app',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'pk_test_... (tu clave de Stripe)'
  };

  console.log('   📋 Configurar en Vercel Dashboard:');
  for (const [varName, exampleValue] of Object.entries(requiredVars)) {
    console.log(`      ${varName} = ${exampleValue}`);
  }
  
  console.log('\n   🔗 Enlaces útiles:');
  console.log('      Vercel Dashboard: https://vercel.com/dashboard');
  console.log('      Stripe Dashboard: https://dashboard.stripe.com');
}

// Función principal
async function runTests() {
  console.log('🚀 Iniciando pruebas de conexión...\n');
  
  const backendOk = await testBackend();
  const frontendOk = await testFrontend();
  
  await testBackendEndpoints();
  checkEnvironmentVariables();
  
  console.log('\n📊 Resumen:');
  console.log(`   Backend: ${backendOk ? '✅ Funcionando' : '❌ Error'}`);
  console.log(`   Frontend: ${frontendOk ? '✅ Funcionando' : '❌ Error'}`);
  
  if (backendOk && frontendOk) {
    console.log('\n🎉 ¡Todo está funcionando!');
    console.log('   Solo necesitas configurar las variables de entorno en Vercel.');
  } else {
    console.log('\n⚠️  Hay problemas que resolver antes de continuar.');
  }
  
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Configurar variables de entorno en Vercel');
  console.log('   2. Obtener claves de Stripe');
  console.log('   3. Probar login/registro');
  console.log('   4. Probar chat');
  console.log('   5. Configurar dominio personalizado (opcional)');
}

// Ejecutar pruebas
runTests().catch(console.error); 