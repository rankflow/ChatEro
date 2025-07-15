const { AvatarExtendedMemoryService } = require('./src/services/avatarExtendedMemory.js');

// Función para probar diferentes frases
function testDetection(phrase) {
  console.log(`\nProbando: "${phrase}"`);
  const result = AvatarExtendedMemoryService.getAvatarDetail('avatar_aria', phrase);
  if (result) {
    console.log(`✅ Detectado: ${result}`);
  } else {
    console.log(`❌ No detectado`);
  }
}

// Pruebas
console.log('=== PRUEBAS DE DETECCIÓN ===');

// Deberían detectarse
testDetection('tienes novio?');
testDetection('cuál es tu edad?');
testDetection('de dónde eres?');
testDetection('qué haces?');

// NO deberían detectarse
testDetection('edad de piedra');
testDetection('estoy en la edad de oro');
testDetection('la edad media fue interesante');
testDetection('tengo edad para eso');

console.log('\n=== FIN DE PRUEBAS ==='); 