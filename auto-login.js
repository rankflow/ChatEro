// Script para hacer login automático
// Ejecuta esto en la consola del navegador (F12)

console.log('🔐 Haciendo login automático...');

// Hacer login con usuario de prueba
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('✅ Login exitoso');
    
    // Guardar token en localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    console.log('💾 Token guardado en localStorage');
    console.log('🔑 Token:', data.token.substring(0, 50) + '...');
    
    // Recargar la página
    console.log('🔄 Recargando página...');
    window.location.reload();
  } else {
    console.log('❌ Error en login:', data.message);
  }
})
.catch(error => {
  console.log('❌ Error de conexión:', error.message);
}); 