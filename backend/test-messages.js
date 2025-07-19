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

async function testMessages() {
  try {
    console.log('🔍 Probando guardado de mensajes...\n');
    
    // 1. Verificar si hay usuarios
    const users = await prisma.user.findMany();
    console.log(`📊 Usuarios encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }
    
    const testUserId = users[0].id;
    console.log(`\n🎯 Usando usuario de prueba: ${users[0].email}`);
    
    // 2. Verificar si hay avatares
    const avatars = await prisma.avatar.findMany();
    console.log(`\n📊 Avatares encontrados: ${avatars.length}`);
    avatars.forEach(avatar => {
      console.log(`   - ${avatar.name} (ID: ${avatar.id})`);
    });
    
    if (avatars.length === 0) {
      console.log('❌ No hay avatares en la base de datos');
      return;
    }
    
    const testAvatarId = avatars[0].id;
    console.log(`\n🎯 Usando avatar de prueba: ${avatars[0].name}`);
    
    // 3. Verificar mensajes existentes
    const existingMessages = await prisma.message.findMany({
      where: { userId: testUserId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`\n📊 Mensajes existentes para el usuario: ${existingMessages.length}`);
    existingMessages.forEach(msg => {
      console.log(`   - ${msg.isUser ? 'Usuario' : 'IA'}: "${msg.content.substring(0, 50)}..." (${msg.createdAt})`);
    });
    
    // 4. Intentar crear un mensaje de prueba
    console.log('\n🧪 Creando mensaje de prueba...');
    
    const testMessage = await prisma.message.create({
      data: {
        userId: testUserId,
        content: 'Mensaje de prueba desde script',
        isUser: true,
        avatarId: testAvatarId,
        tokensUsed: 0
      }
    });
    
    console.log(`✅ Mensaje creado exitosamente:`);
    console.log(`   - ID: ${testMessage.id}`);
    console.log(`   - Contenido: ${testMessage.content}`);
    console.log(`   - Usuario: ${testMessage.isUser ? 'Sí' : 'No'}`);
    console.log(`   - Avatar: ${testMessage.avatarId}`);
    console.log(`   - Creado: ${testMessage.createdAt}`);
    
    // 5. Verificar que se guardó
    const newMessages = await prisma.message.findMany({
      where: { userId: testUserId },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    
    console.log(`\n📊 Mensajes después de la prueba: ${newMessages.length}`);
    if (newMessages.length > 0) {
      console.log(`   - Último mensaje: "${newMessages[0].content}"`);
    }
    
    // 6. Limpiar mensaje de prueba
    await prisma.message.delete({
      where: { id: testMessage.id }
    });
    console.log('\n🧹 Mensaje de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
}

testMessages()
  .then(() => {
    console.log('\n✅ Prueba completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 