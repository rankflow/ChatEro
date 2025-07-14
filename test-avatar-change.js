const fetch = require('node-fetch');

async function testAvatarChange() {
  const API_BASE_URL = 'http://localhost:3001';
  
  try {
    console.log('🔍 Probando cambio de avatar...');
    
    // 1. Login
    console.log('\n1. Haciendo login...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // 2. Enviar mensaje con Aria
    console.log('\n2. Enviando mensaje con Aria...');
    const ariaResponse = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'Hola Aria',
        avatarId: 'avatar_aria',
        conversationHistory: [],
        conversationMemory: {}
      }),
    });
    
    const ariaData = await ariaResponse.json();
    console.log('✅ Respuesta de Aria:', ariaData.message);
    
    // 3. Cambiar a Luna (simular cambio de avatar)
    console.log('\n3. Cambiando a Luna...');
    const lunaResponse = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'Hola Luna',
        avatarId: 'avatar_luna',
        conversationHistory: [], // Contexto limpio
        conversationMemory: {}   // Memoria limpia
      }),
    });
    
    const lunaData = await lunaResponse.json();
    console.log('✅ Respuesta de Luna:', lunaData.message);
    
    // 4. Verificar que no hay confusión
    if (lunaData.message.includes('Aria') || lunaData.message.includes('aria')) {
      console.log('❌ ERROR: Luna menciona a Aria - Confusión de contexto');
    } else {
      console.log('✅ SUCCESS: Luna responde correctamente sin confusión');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAvatarChange(); 