import { AvatarSyncService } from './src/services/avatarSyncService.js';

async function testSync() {
  console.log('=== PRUEBA DE SINCRONIZACIÓN DE AVATARES ===\n');
  
  try {
    // Sincronizar todos los avatares
    console.log('Sincronizando todos los avatares...');
    const syncedAvatars = await AvatarSyncService.syncAllAvatars();
    
    console.log(`\n✅ Sincronizados ${syncedAvatars.length} avatares:`);
    
    for (const avatar of syncedAvatars) {
      console.log(`\n--- ${avatar.name} ---`);
      console.log(`ID: ${avatar.id}`);
      console.log(`Edad: ${avatar.age || 'No especificada'}`);
      console.log(`Ocupación: ${avatar.occupation || 'No especificada'}`);
      console.log(`Origen: ${avatar.origin || 'No especificado'}`);
      console.log(`Personalidad completa: ${avatar.fullPersonality}`);
      console.log(`Intereses completos: ${avatar.fullInterests}`);
      console.log(`Background completo: ${avatar.fullBackground}`);
      
      // Mostrar algunos datos extendidos si existen
      if (avatar.relationships) {
        console.log(`Relaciones: ${avatar.relationships}`);
      }
      if (avatar.secrets) {
        console.log(`Secretos: ${avatar.secrets}`);
      }
      if (avatar.kinks) {
        console.log(`Kinks: ${avatar.kinks}`);
      }
    }
    
    // Probar obtener datos sincronizados de un avatar específico
    console.log('\n=== PROBANDO OBTENCIÓN DE DATOS SINCRONIZADOS ===');
    const ariaData = AvatarSyncService.getSyncedAvatarData('aria');
    if (ariaData) {
      console.log('\n✅ Datos de Aria obtenidos correctamente');
      console.log(`Nombre: ${ariaData.name}`);
      console.log(`Personalidad completa: ${ariaData.fullPersonality}`);
    } else {
      console.log('\n❌ No se pudieron obtener los datos de Aria');
    }
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  }
  
  console.log('\n=== FIN DE PRUEBA ===');
}

testSync(); 