const fetch = require('node-fetch');

async function testAuthentication() {
  const API_BASE_URL = 'http://localhost:3001';
  
  try {
    console.log('🔍 Probando autenticación...');
    
    // 1. Probar login
    console.log('\n1. Haciendo login...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Error en login:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso:', loginData.success);
    console.log('🔑 Token obtenido:', loginData.token.substring(0, 50) + '...');
    
    // 2. Probar endpoint protegido con token
    console.log('\n2. Probando endpoint protegido...');
    const chatResponse = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        message: 'Test de autenticación',
        avatarId: 'avatar_aria',
        conversationHistory: [],
        conversationMemory: {}
      }),
    });
    
    console.log('📡 Status del chat:', chatResponse.status);
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Chat funcionando con autenticación:', chatData.success);
    } else {
      const errorText = await chatResponse.text();
      console.log('❌ Error en chat:', errorText);
    }
    
    // 3. Probar sin token (debería fallar)
    console.log('\n3. Probando sin token (debería fallar)...');
    const noAuthResponse = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test sin autenticación',
        avatarId: 'avatar_aria',
        conversationHistory: [],
        conversationMemory: {}
      }),
    });
    
    console.log('📡 Status sin auth:', noAuthResponse.status);
    if (noAuthResponse.status === 401) {
      console.log('✅ Correcto: Sin token devuelve 401');
    } else {
      console.log('❌ Error: Sin token no devuelve 401');
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

testAuthentication(); 