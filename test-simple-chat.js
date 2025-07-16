// Test simple para verificar el endpoint de chat asíncrono
const API_BASE_URL = 'http://localhost:3001';

async function testSimpleChat() {
  console.log('🧪 Test simple del chat...\n');
  
  try {
    // 1. Login
    console.log('🔐 Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login falló');
    }
    
    const token = loginData.token;
    console.log('✅ Login exitoso\n');
    
    // 2. Test primer mensaje
    console.log('📝 Enviando primer mensaje...');
    const chatResponse = await fetch(`${API_BASE_URL}/api/chat/message/async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: ['hola'],
        avatarId: '1',
        userTyping: false,
        userTypingSpeed: 0,
        timeSinceLastMessage: 1000
      })
    });
    
    console.log('📊 Status de respuesta:', chatResponse.status);
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Respuesta recibida:');
      console.log('   Success:', chatData.success);
      console.log('   Should wait:', chatData.shouldWait);
      console.log('   Has message:', !!chatData.message);
      console.log('   Message length:', chatData.message?.length || 0);
      console.log('   Strategy:', chatData.strategy);
      console.log('   Reason:', chatData.reason);
      
      if (chatData.message) {
        console.log('   Message preview:', chatData.message.substring(0, 100) + '...');
      }
    } else {
      const errorText = await chatResponse.text();
      console.log('❌ Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

testSimpleChat(); 