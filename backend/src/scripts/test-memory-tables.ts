import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMemoryTables() {
  try {
    console.log('🧪 Probando acceso a tablas de memoria...\n');

    // 1. Verificar que podemos acceder a las tablas
    console.log('📊 Verificando tablas de memoria...');
    
    // Contar registros en cada tabla
    const userMemoryCount = await prisma.userMemory.count();
    const conversationEmbeddingsCount = await prisma.conversationEmbedding.count();
    const memoryClustersCount = await prisma.memoryCluster.count();
    const sessionSummariesCount = await prisma.sessionSummary.count();

    console.log(`✅ user_memory: ${userMemoryCount} registros`);
    console.log(`✅ conversation_embeddings: ${conversationEmbeddingsCount} registros`);
    console.log(`✅ memory_clusters: ${memoryClustersCount} registros`);
    console.log(`✅ session_summaries: ${sessionSummariesCount} registros`);

    // 2. Verificar que podemos acceder a usuarios y avatares
    console.log('\n👥 Verificando usuarios y avatares...');
    
    const users = await prisma.user.findMany();
    const avatars = await prisma.avatar.findMany();
    
    console.log(`✅ Usuarios encontrados: ${users.length}`);
    console.log(`✅ Avatares encontrados: ${avatars.length}`);

    if (users.length > 0 && avatars.length > 0) {
      console.log(`👤 Primer usuario: ${users[0].username}`);
      console.log(`🤖 Primer avatar: ${avatars[0].name}`);
    }

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ Las tablas de memoria están funcionando correctamente');

  } catch (error) {
    console.error('❌ Error probando tablas de memoria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMemoryTables(); 