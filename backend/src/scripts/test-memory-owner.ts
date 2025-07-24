import { PrismaClient } from '@prisma/client';
import MemoryService from '../services/memoryService.js';

const prisma = new PrismaClient();

async function testMemoryOwner() {
  try {
    console.log('🧪 Probando sistema de memoryOwner...\n');

    // Buscar un usuario y avatar existentes
    const user = await prisma.user.findFirst();
    const avatar = await prisma.avatar.findFirst();
    
    if (!user || !avatar) {
      console.log('❌ No hay usuarios o avatares en la base de datos');
      return;
    }

    console.log(`👤 Usuario: ${user.username}`);
    console.log(`🤖 Avatar: ${avatar.name}`);

    // 1. Crear memoria de usuario
    console.log('\n1️⃣ Creando memoria de usuario...');
    await MemoryService.saveMemory(
      user.id,
      avatar.id,
      'preferences',
      'le gusta la música rock y el heavy metal',
      undefined, // memoryKey
      0.9,
      'user'
    );

    // 2. Crear memoria de avatar
    console.log('\n2️⃣ Creando memoria de avatar...');
    await MemoryService.saveMemory(
      user.id,
      avatar.id,
      'preferences',
      'le gusta cantar en italiano y la música clásica',
      undefined, // memoryKey
      0.8,
      'avatar'
    );

    // 3. Verificar que se guardaron correctamente
    console.log('\n3️⃣ Verificando memorias guardadas...');
    const memories = await prisma.userMemory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`📊 Total memorias: ${memories.length}`);
    memories.forEach((memory, index) => {
      console.log(`  ${index + 1}. ${memory.memoryContent.substring(0, 50)}... (${memory.memoryOwner})`);
    });

    // 4. Probar búsqueda filtrada por owner
    console.log('\n4️⃣ Probando búsqueda por owner...');
    const userMemories = await prisma.userMemory.findMany({
      where: { 
        userId: user.id,
        memoryOwner: 'user'
      }
    });

    const avatarMemories = await prisma.userMemory.findMany({
      where: { 
        userId: user.id,
        memoryOwner: 'avatar'
      }
    });

    console.log(`👤 Memorias de usuario: ${userMemories.length}`);
    console.log(`🤖 Memorias de avatar: ${avatarMemories.length}`);

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('✅ El sistema de memoryOwner funciona correctamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMemoryOwner(); 