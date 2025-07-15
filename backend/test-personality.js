import { AvatarSyncService } from './src/services/avatarSyncService.js';

async function testPersonality() {
  console.log('=== PRUEBA DE GENERACIÓN DE PERSONALIDADES ===\n');
  
  try {
    // Sincronizar todos los avatares
    console.log('Sincronizando todos los avatares...');
    const syncedAvatars = await AvatarSyncService.syncAllAvatars();
    
    console.log(`\n✅ Sincronizados ${syncedAvatars.length} avatares:`);
    
    for (const avatar of syncedAvatars) {
      console.log(`\n--- ${avatar.name} ---`);
      console.log(`Edad: ${avatar.age}`);
      console.log(`Ocupación: ${avatar.occupation}`);
      console.log(`Intereses: ${avatar.interests}`);
      console.log(`Kinks: ${avatar.kinks}`);
      console.log(`Personalidad básica: ${avatar.personality}`);
      console.log(`Personalidad completa: ${avatar.fullPersonality}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n=== FIN DE PRUEBA ===');
}

testPersonality(); 