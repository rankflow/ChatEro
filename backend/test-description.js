import { AvatarSyncService } from './src/services/avatarSyncService.js';

async function testDescription() {
  console.log('=== PRUEBA DE GENERACIÓN DE DESCRIPCIONES ===\n');
  
  try {
    // Sincronizar Aria para ver la descripción generada
    console.log('Sincronizando Aria...');
    const ariaData = await AvatarSyncService.syncAvatar('aria');
    
    if (ariaData) {
      console.log('\n✅ Datos de Aria:');
      console.log(`Nombre: ${ariaData.name}`);
      console.log(`Edad: ${ariaData.age}`);
      console.log(`Ocupación: ${ariaData.occupation}`);
      console.log(`Intereses: ${ariaData.interests}`);
      console.log(`Descripción: ${ariaData.description}`);
      console.log(`Personalidad: ${ariaData.fullPersonality}`);
    } else {
      console.log('\n❌ Error sincronizando Aria');
    }
    
    // Probar con otros avatares
    console.log('\n=== PROBANDO OTROS AVATARES ===');
    const avatars = ['luna', 'sofia', 'venus'];
    
    for (const avatarName of avatars) {
      console.log(`\nSincronizando ${avatarName}...`);
      const avatarData = await AvatarSyncService.syncAvatar(avatarName);
      
      if (avatarData) {
        console.log(`✅ ${avatarName}: ${avatarData.description}`);
      } else {
        console.log(`❌ Error con ${avatarName}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n=== FIN DE PRUEBA ===');
}

testDescription(); 