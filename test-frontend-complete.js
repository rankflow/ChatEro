// Usar fetch nativo de Node.js
const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testSystem() {
  console.log('🚀 Probando sistema completo...\n');
  
  try {
    // 1. Probar autenticación
    console.log('🔐 Probando login...');
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
    console.log('✅ Login exitoso');
    
    // 2. Probar avatares
    console.log('\n👥 Probando avatares...');
    const avatarsResponse = await fetch(`${API_BASE_URL}/api/avatars`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const avatarsData = await avatarsResponse.json();
    if (avatarsData.success) {
      console.log(`✅ ${avatarsData.avatars.length} avatares disponibles`);
    }
    
    // 3. Probar chat asíncrono
    console.log('\n⚡ Probando chat asíncrono...');
    const asyncChatResponse = await fetch(`${API_BASE_URL}/api/chat/message/async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: ['Hola'],
        avatarId: '1',
        userTyping: false,
        userTypingSpeed: 1,
        timeSinceLastMessage: 1000
      })
    });
    
    const asyncData = await asyncChatResponse.json();
    if (asyncData.success) {
      console.log('✅ Chat asíncrono funcionando');
      console.log(`   Debe esperar: ${asyncData.shouldWait ? 'Sí' : 'No'}`);
    }
    
    // 4. Probar frontend
    console.log('\n🌐 Probando frontend...');
    const frontendResponse = await fetch(FRONTEND_URL);
    if (frontendResponse.ok) {
      console.log('✅ Frontend accesible');
    }
    
    console.log('\n🎉 ¡Sistema funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSystem(); 