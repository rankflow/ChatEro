const fetch = require('node-fetch');

async function testBackend() {
  try {
    console.log('🔍 Probando conexión al backend...');
    
    const response = await fetch('http://localhost:3001/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend funcionando:', data);
    } else {
      console.log('❌ Backend no responde correctamente:', response.status);
    }
  } catch (error) {
    console.log('❌ Error conectando al backend:', error.message);
    console.log('💡 Asegúrate de que el backend esté corriendo en puerto 3001');
  }
}

testBackend(); 