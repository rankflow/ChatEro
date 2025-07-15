import { AvatarExtendedMemoryService } from './src/services/avatarExtendedMemory.ts';

async function testQuick() {
  console.log('🧠 Prueba rápida de memoria extendida\n');

  // Probar con avatar_aria (como viene del frontend)
  const avatarId = 'avatar_aria';
  const testIntents = [
    'miedos',
    'origen', 
    'motivaciones',
    'perfume',
    'edad'
  ];

  console.log(`Probando avatar: ${avatarId}`);
  
  for (const intent of testIntents) {
    console.log(`\n🔍 Intentando: "${intent}"`);
    const result = AvatarExtendedMemoryService.getAvatarDetail(avatarId, intent);
    if (result) {
      console.log(`✅ Encontrado: ${result.substring(0, 100)}...`);
    } else {
      console.log(`❌ No encontrado`);
    }
  }

  console.log('\n🎉 Prueba completada!');
}

testQuick().catch(console.error); 