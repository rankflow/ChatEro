import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrismaConnection() {
  console.log('🧪 Probando conexión de Prisma...\n');

  try {
    // 1. Probar conexión básica
    console.log('1️⃣ Probando conexión básica...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa');

    // 2. Verificar si las tablas de memoria existen
    console.log('\n2️⃣ Verificando tablas de memoria...');
    
    try {
      // Intentar acceder a las tablas de memoria
      const userMemories = await prisma.userMemory.findMany({ take: 1 });
      console.log('✅ Tabla userMemory existe');
    } catch (error) {
      console.log('❌ Tabla userMemory no existe:', error.message);
    }

    try {
      const conversationEmbeddings = await prisma.conversationEmbedding.findMany({ take: 1 });
      console.log('✅ Tabla conversationEmbedding existe');
    } catch (error) {
      console.log('❌ Tabla conversationEmbedding no existe:', error.message);
    }

    try {
      const memoryClusters = await prisma.memoryCluster.findMany({ take: 1 });
      console.log('✅ Tabla memoryCluster existe');
    } catch (error) {
      console.log('❌ Tabla memoryCluster no existe:', error.message);
    }

    try {
      const sessionSummaries = await prisma.sessionSummary.findMany({ take: 1 });
      console.log('✅ Tabla sessionSummary existe');
    } catch (error) {
      console.log('❌ Tabla sessionSummary no existe:', error.message);
    }

    // 3. Verificar tablas existentes
    console.log('\n3️⃣ Verificando tablas existentes...');
    try {
      const users = await prisma.user.findMany({ take: 1 });
      console.log('✅ Tabla user existe');
    } catch (error) {
      console.log('❌ Tabla user no existe:', error.message);
    }

    try {
      const avatars = await prisma.avatar.findMany({ take: 1 });
      console.log('✅ Tabla avatar existe');
    } catch (error) {
      console.log('❌ Tabla avatar no existe:', error.message);
    }

    try {
      const messages = await prisma.message.findMany({ take: 1 });
      console.log('✅ Tabla message existe');
    } catch (error) {
      console.log('❌ Tabla message no existe:', error.message);
    }

    console.log('\n🎉 Verificación de Prisma completada');

  } catch (error) {
    console.error('\n❌ Error en la conexión de Prisma:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testPrismaConnection().catch(console.error); 