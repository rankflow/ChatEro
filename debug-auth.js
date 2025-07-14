// Script para verificar autenticación en el navegador
// Ejecuta esto en la consola del navegador (F12)

console.log('🔍 Verificando estado de autenticación...');

// Verificar localStorage
const authToken = localStorage.getItem('authToken');
const user = localStorage.getItem('user');

console.log('🔑 Token en localStorage:', authToken ? 'SÍ' : 'NO');
console.log('👤 Usuario en localStorage:', user ? 'SÍ' : 'NO');

if (authToken) {
  console.log('📝 Token (primeros 50 chars):', authToken.substring(0, 50) + '...');
  
  // Verificar si el token es válido
  fetch('http://localhost:3001/health', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  .then(response => {
    console.log('🌐 Test de conexión con token:', response.status);
    if (response.ok) {
      console.log('✅ Token válido');
    } else {
      console.log('❌ Token inválido o expirado');
    }
  })
  .catch(error => {
    console.log('❌ Error de conexión:', error.message);
  });
} else {
  console.log('❌ No hay token guardado');
}

// Verificar URL actual
console.log('📍 URL actual:', window.location.href);

// Verificar si estamos en la página de chat
if (window.location.pathname.includes('/chat')) {
  console.log('💬 Estamos en la página de chat');
} else {
  console.log('🏠 No estamos en la página de chat');
} 