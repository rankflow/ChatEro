// Script simple para probar la sincronización
import { AvatarSyncService } from './src/services/avatarSyncService.js';

async function testSync() {
  console.log('=== PRUEBA DE SINCRONIZACIÓN ===\n');
  
  try {
    // Sincronizar solo Aria primero
    console.log('Sincronizando Aria...');
    const ariaData = await AvatarSyncService.syncAvatar('aria');
    
    if (ariaData) {
      console.log('\n✅ Aria sincronizada correctamente:');
      console.log(`Nombre: ${ariaData.name}`);
      console.log(`Edad: ${ariaData.age}`);
      console.log(`Ocupación: ${ariaData.occupation}`);
      console.log(`Origen: ${ariaData.origin}`);
      console.log(`Personalidad completa: ${ariaData.fullPersonality}`);
      console.log(`Intereses completos: ${ariaData.fullInterests}`);
      console.log(`Background completo: ${ariaData.fullBackground}`);
      console.log(`Relaciones: ${ariaData.relationships}`);
      console.log(`Secretos: ${ariaData.secrets}`);
      console.log(`Kinks: ${ariaData.kinks}`);
    } else {
      console.log('\n❌ Error sincronizando Aria');
    }
    
    // Probar obtener datos sincronizados
    console.log('\n=== PROBANDO OBTENCIÓN DE DATOS ===');
    const syncedAria = AvatarSyncService.getSyncedAvatarData('aria');
    if (syncedAria) {
      console.log('✅ Datos sincronizados obtenidos correctamente');
    } else {
      console.log('❌ No se pudieron obtener los datos sincronizados');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n=== FIN DE PRUEBA ===');
}

testSync(); 