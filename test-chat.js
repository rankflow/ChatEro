const fetch = require('node-fetch');

async function testChatConnection() {
  const API_BASE_URL = 'http://localhost:3001';
  
  try {
    console.log('🔍 Probando conexión al chat...');
    
    // 1. Probar endpoint de salud
    console.log('\n1. Probando endpoint de salud...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log('✅ Health endpoint:', healthResponse.status);
    
    // 2. Probar login con usuario de prueba
    console.log('\n2. Probando login...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login exitoso:', loginData.success);
      
      // 3. Probar envío de mensaje
      console.log('\n3. Probando envío de mensaje...');
      const chatResponse = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          message: 'Hola',
          avatarId: 'avatar_aria',
          conversationHistory: [],
          conversationMemory: null
        }),
      });
      
      console.log('📡 Status del chat:', chatResponse.status);
      
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        console.log('✅ Chat funcionando:', chatData.success);
        console.log('📝 Respuesta:', chatData.message);
      } else {
        const errorText = await chatResponse.text();
        console.log('❌ Error en chat:', errorText);
      }
      
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Error en login:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

testChatConnection(); 