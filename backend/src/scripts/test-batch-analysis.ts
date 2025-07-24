import { PrismaClient } from '@prisma/client';
import { BatchMemoryAnalysisService } from '../services/batchMemoryAnalysisService.js';
import { ConversationEndDetectionService } from '../services/conversationEndDetectionService.js';

const prisma = new PrismaClient();

async function testBatchAnalysis() {
  try {
    console.log('🧪 Iniciando pruebas de análisis batch...');

    // Datos de prueba
    const testUserId = 'cmdhqeh6z0000rka7t0462120'; // ID del usuario test@example.com
    const testAvatarId = 'cmdhqeh720001rka7bifkgpo8'; // ID de Aria

    console.log(`📋 Usuario de prueba: ${testUserId}`);
    console.log(`📋 Avatar de prueba: ${testAvatarId}`);

    // 1. Verificar si existen mensajes de prueba
    const existingMessages = await prisma.message.findMany({
      where: {
        userId: testUserId,
        avatarId: testAvatarId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Mensajes existentes: ${existingMessages.length}`);

    if (existingMessages.length === 0) {
      console.log('⚠️ No hay mensajes de prueba. Creando algunos mensajes de ejemplo...');
      
      // Crear mensajes de prueba
      const testMessages = [
        {
          userId: testUserId,
          avatarId: testAvatarId,
          content: 'Hola Aria, me gusta mucho la música rock y el jazz',
          isUser: true,
          tokensUsed: 0
        },
        {
          userId: testUserId,
          avatarId: testAvatarId,
          content: '¡Hola! Me encanta que te guste la música. Yo también toco un poco la guitarra y canto en italiano. ¿Qué tipo de música te hace vibrar?',
          isUser: false,
          tokensUsed: 50
        },
        {
          userId: testUserId,
          avatarId: testAvatarId,
          content: 'Me encanta la música que te hace sentir cosas intensas, ya sabes, de esas que te llegan al corazón',
          isUser: true,
          tokensUsed: 0
        },
        {
          userId: testUserId,
          avatarId: testAvatarId,
          content: '¡Perfecto! Esa es exactamente la música que más me gusta. También me encanta la comida italiana, especialmente la pasta y la pizza',
          isUser: false,
          tokensUsed: 45
        },
        {
          userId: testUserId,
          avatarId: testAvatarId,
          content: '¡Qué coincidencia! A mí también me encanta la comida italiana. La pasta carbonara es mi favorita',
          isUser: true,
          tokensUsed: 0
        }
      ];

      for (const message of testMessages) {
        await prisma.message.create({
          data: {
            ...message,
            createdAt: new Date(Date.now() - Math.random() * 3600000) // Última hora
          }
        });
      }

      console.log('✅ Mensajes de prueba creados');
    }

    // 2. Verificar estado de conversación
    console.log('\n🔍 Verificando estado de conversación...');
    
    const conversationEnded = await ConversationEndDetectionService.detectConversationEnd(testUserId, testAvatarId);
    const timeSinceLastMessage = await ConversationEndDetectionService.getTimeSinceLastMessage(testUserId, testAvatarId);
    const conversationDuration = await ConversationEndDetectionService.getConversationDuration(testUserId, testAvatarId);
    
    console.log(`📊 Estado de conversación:`);
    console.log(`   - ¿Terminada?: ${conversationEnded}`);
    console.log(`   - Tiempo desde último mensaje: ${timeSinceLastMessage} minutos`);
    console.log(`   - Duración total: ${conversationDuration} minutos`);

    // 3. Verificar categorías de memoria
    console.log('\n📂 Verificando categorías de memoria...');
    
    const categories = await prisma.memoryCategory.findMany({
      include: {
        children: true
      },
      where: { parentId: null },
      orderBy: { id: 'asc' }
    });

    console.log(`📊 Categorías disponibles: ${categories.length}`);
    for (const category of categories) {
      console.log(`   - ${category.name} (${category.children.length} subcategorías)`);
    }

    // 4. Ejecutar análisis batch
    console.log('\n🚀 Ejecutando análisis batch...');
    
    const startTime = Date.now();
    await BatchMemoryAnalysisService.analyzeConversation(testUserId, testAvatarId);
    const endTime = Date.now();
    
    console.log(`⏱️ Análisis batch completado en ${endTime - startTime}ms`);

    // 5. Verificar memorias creadas
    console.log('\n💾 Verificando memorias creadas...');
    
    const memories = await prisma.userMemory.findMany({
      where: {
        userId: testUserId,
        avatarId: testAvatarId,
        source: 'batch_analysis'
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Memorias de batch analysis: ${memories.length}`);
    
    for (const memory of memories) {
      console.log(`   - [${memory.memoryOwner}] ${memory.category.name}: ${memory.memoryContent}`);
      if (memory.tags) {
        console.log(`     Tags: ${memory.tags}`);
      }
    }

    // 6. Estadísticas finales
    console.log('\n📈 Estadísticas finales:');
    
    const totalMemories = await prisma.userMemory.count({
      where: {
        userId: testUserId,
        avatarId: testAvatarId
      }
    });
    
    const activeMemories = await prisma.userMemory.count({
      where: {
        userId: testUserId,
        avatarId: testAvatarId,
        isActive: true
      }
    });
    
    console.log(`   - Total memorias: ${totalMemories}`);
    console.log(`   - Memorias activas: ${activeMemories}`);
    console.log(`   - Memorias de batch: ${memories.length}`);

    console.log('\n✅ Pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar pruebas
testBatchAnalysis()
  .then(() => {
    console.log('🎉 Script de prueba completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en script de prueba:', error);
    process.exit(1);
  }); 