import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(__dirname, 'prisma', 'dev.db')}`
    }
  }
});

async function verificarInconsistencias() {
  try {
    console.log('🔍 Verificando inconsistencias en IDs de avatares...\n');
    
    // 1. Obtener todos los avatares
    const avatars = await prisma.avatar.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`📊 Avatares en la base de datos (${avatars.length}):`);
    avatars.forEach(avatar => {
      console.log(`   - ${avatar.name} (ID: ${avatar.id})`);
    });
    
    // 2. Obtener todos los mensajes con avatarId
    const messages = await prisma.message.findMany({
      where: {
        avatarId: {
          not: null
        }
      },
      include: {
        avatar: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📊 Mensajes con avatarId (${messages.length}):`);
    messages.forEach(msg => {
      console.log(`   - Mensaje: "${msg.content.substring(0, 30)}..."`);
      console.log(`     AvatarId: ${msg.avatarId}`);
      console.log(`     Avatar encontrado: ${msg.avatar ? msg.avatar.name : 'NO ENCONTRADO'}`);
      console.log(`     Usuario: ${msg.isUser ? 'Sí' : 'No'}`);
      console.log(`     Fecha: ${msg.createdAt}`);
      console.log('');
    });
    
    // 3. Verificar IDs únicos de avatares en mensajes
    const avatarIdsInMessages = [...new Set(messages.map(msg => msg.avatarId).filter(Boolean))];
    console.log(`\n🔍 IDs únicos de avatares en mensajes (${avatarIdsInMessages.length}):`);
    avatarIdsInMessages.forEach(avatarId => {
      console.log(`   - ${avatarId}`);
    });
    
    // 4. Verificar IDs únicos de avatares en tabla avatars
    const avatarIdsInAvatars = avatars.map(avatar => avatar.id);
    console.log(`\n🔍 IDs únicos de avatares en tabla avatars (${avatarIdsInAvatars.length}):`);
    avatarIdsInAvatars.forEach(avatarId => {
      console.log(`   - ${avatarId}`);
    });
    
    // 5. Encontrar inconsistencias
    const inconsistencias = avatarIdsInMessages.filter(avatarId => 
      !avatarIdsInAvatars.includes(avatarId)
    );
    
    if (inconsistencias.length > 0) {
      console.log(`\n❌ INCONSISTENCIAS ENCONTRADAS (${inconsistencias.length}):`);
      inconsistencias.forEach(avatarId => {
        console.log(`   - AvatarId en mensajes: ${avatarId} (NO EXISTE EN TABLA AVATARS)`);
      });
    } else {
      console.log(`\n✅ NO HAY INCONSISTENCIAS - Todos los avatarIds en mensajes existen en la tabla avatars`);
    }
    
    // 6. Verificar mensajes sin avatar
    const messagesWithoutAvatar = await prisma.message.findMany({
      where: {
        avatarId: null
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📊 Mensajes sin avatarId (${messagesWithoutAvatar.length}):`);
    messagesWithoutAvatar.forEach(msg => {
      console.log(`   - "${msg.content.substring(0, 50)}..." (${msg.createdAt})`);
    });
    
    // 7. Verificar formato de IDs
    console.log(`\n🔍 Análisis de formatos de IDs:`);
    avatarIdsInMessages.forEach(avatarId => {
      if (avatarId.startsWith('avatar_')) {
        console.log(`   - ${avatarId} (formato avatar_nombre)`);
      } else if (avatarId.length > 20) {
        console.log(`   - ${avatarId} (formato cuid)`);
      } else {
        console.log(`   - ${avatarId} (formato desconocido)`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
}

verificarInconsistencias()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 