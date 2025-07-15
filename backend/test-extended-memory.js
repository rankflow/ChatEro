import { AvatarExtendedMemoryService } from './src/services/avatarExtendedMemory.ts';

async function testExtendedMemory() {
  console.log('🧠 Probando Sistema de Memoria Extendida para Avatares\n');

  // Lista de avatares disponibles
  const avatars = ['aria', 'luna', 'sofia', 'venus'];
  
  // Lista de intenciones de prueba
  const testIntents = [
    'perfume',
    'edad',
    'origen',
    'trabajo',
    'personalidad',
    'miedos',
    'sueños',
    'relaciones',
    'experiencias',
    'comunicación',
    'estado',
    'motivaciones',
    'conflictos',
    'crecimiento',
    'acento',
    'manerismos',
    'estilo',
    'chateas',
    'temas',
    'límites',
    'kinks',
    'roleplay'
  ];

  for (const avatar of avatars) {
    console.log(`\n👤 Probando avatar: ${avatar.toUpperCase()}`);
    console.log('='.repeat(50));

    // Probar obtener todos los datos
    console.log('\n📋 Datos completos del avatar:');
    const fullData = AvatarExtendedMemoryService.getAvatarFullData(avatar);
    if (fullData) {
      console.log(`✅ Nombre: ${fullData.name}`);
      console.log(`✅ Edad: ${fullData.age}`);
      console.log(`✅ Ocupación: ${fullData.occupation}`);
      console.log(`✅ Origen: ${fullData.origin}`);
    } else {
      console.log(`❌ No se encontraron datos para ${avatar}`);
    }

    // Probar intenciones específicas
    console.log('\n🔍 Probando intenciones específicas:');
    for (const intent of testIntents.slice(0, 5)) { // Solo probar las primeras 5 para no saturar
      const detail = AvatarExtendedMemoryService.getAvatarDetail(avatar, intent);
      if (detail) {
        console.log(`✅ "${intent}": ${detail.substring(0, 50)}...`);
      } else {
        console.log(`❌ "${intent}": No encontrado`);
      }
    }

    console.log('\n' + '='.repeat(50));
  }

  // Probar casos especiales
  console.log('\n🎯 Probando casos especiales:');
  console.log('='.repeat(50));

  // Probar avatar inexistente
  const nonExistentDetail = AvatarExtendedMemoryService.getAvatarDetail('inexistente', 'perfume');
  console.log(`Avatar inexistente: ${nonExistentDetail ? '❌ Error' : '✅ Correcto'}`);

  // Probar intención inexistente
  const nonExistentIntent = AvatarExtendedMemoryService.getAvatarDetail('aria', 'intencion_inexistente');
  console.log(`Intención inexistente: ${nonExistentIntent ? '❌ Error' : '✅ Correcto'}`);

  // Probar limpiar cache
  AvatarExtendedMemoryService.clearCache();
  console.log('✅ Cache limpiado correctamente');

  console.log('\n🎉 Pruebas completadas!');
}

// Ejecutar las pruebas
testExtendedMemory().catch(console.error); 