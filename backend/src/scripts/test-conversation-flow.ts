import { PrismaClient } from '@prisma/client';
import { ConversationEndDetectionService } from '../services/conversationEndDetectionService.js';
import { BatchMemoryAnalysisService } from '../services/batchMemoryAnalysisService.js';

const prisma = new PrismaClient();

async function testConversationFlow() {
  try {
    console.log('🧪 Probando flujo completo de conversación...');

    // Datos de prueba
    const testUserId = 'cmdhqeh6z0000rka7t0462120'; // test@example.com
    const testAvatarId = 'cmdhqeh720001rka7bifkgpo8'; // Aria

    console.log(`📋 Usuario: ${testUserId}`);
    console.log(`📋 Avatar: ${testAvatarId}`);

    // 1. Simular conversación activa
    console.log('\n💬 Simulando conversación activa...');
    
    const conversationMessages = [
      {
        userId: testUserId,
        avatarId: testAvatarId,
        content: 'Hola Aria, ¿cómo estás hoy?',
        isUser: true,
        tokensUsed: 0
      },
      {
        userId: testUserId,
        avatarId: testAvatarId,
        content: '¡Hola! Estoy muy bien, gracias por preguntar. ¿Y tú cómo te sientes?',
        isUser: false,
        tokensUsed: 25
      },
      {
        userId: testUserId,
        avatarId: testAvatarId,
        content: 'Me siento genial. Me encanta la música rock, especialmente Queen',
        isUser: true,
        tokensUsed: 0
      },
      {
        userId: testUserId,
        avatarId: testAvatarId,
        content: '¡Queen es increíble! A mí también me gusta mucho. Toco un poco la guitarra y canto en italiano',
        isUser: false,
        tokensUsed: 30
      },
      {
        userId: testUserId,
        avatarId: testAvatarId,
        content: '¡Qué genial! Yo también toco guitarra. ¿Qué canciones italianas te gustan?',
        isUser: true,
        tokensUsed: 0
      },
      {
        userId: testUserId,
        avatarId: testAvatarId,
        content: 'Me encanta "Volare" y "O Sole Mio". También me gusta mucho la comida italiana',
        isUser: false,
        tokensUsed: 35
      }
    ];

    // Crear mensajes de conversación
    for (const message of conversationMessages) {
      await prisma.message.create({
        data: {
          ...message,
          createdAt: new Date(Date.now() - Math.random() * 1800000) // Últimos 30 minutos
        }
      });
    }

    console.log(`✅ ${conversationMessages.length} mensajes de conversación creados`);

    // 2. Verificar estado inicial
    console.log('\n🔍 Verificando estado inicial...');
    
    const initialStatus = await ConversationEndDetectionService.detectConversationEnd(testUserId, testAvatarId);
    const initialTimeSinceLast = await ConversationEndDetectionService.getTimeSinceLastMessage(testUserId, testAvatarId);
    
    console.log(`📊 Estado inicial:`);
    console.log(`   - ¿Conversación terminada?: ${initialStatus}`);
    console.log(`   - Tiempo desde último mensaje: ${initialTimeSinceLast} minutos`);

    // 3. Simular fin de conversación (esperar más de 30 minutos)
    console.log('\n⏰ Simulando fin de conversación...');
    
    // Crear un mensaje "antiguo" para simular inactividad
    await prisma.message.create({
      data: {
        userId: testUserId,
        avatarId: testAvatarId,
        content: 'Último mensaje de la conversación',
        isUser: true,
        tokensUsed: 0,
        createdAt: new Date(Date.now() - 35 * 60 * 1000) // 35 minutos atrás
      }
    });

    console.log('✅ Mensaje "antiguo" creado para simular inactividad');

    // 4. Verificar detección de fin de conversación
    console.log('\n🔍 Verificando detección de fin de conversación...');
    
    const finalStatus = await ConversationEndDetectionService.detectConversationEnd(testUserId, testAvatarId);
    const finalTimeSinceLast = await ConversationEndDetectionService.getTimeSinceLastMessage(testUserId, testAvatarId);
    
    console.log(`📊 Estado final:`);
    console.log(`   - ¿Conversación terminada?: ${finalStatus}`);
    console.log(`   - Tiempo desde último mensaje: ${finalTimeSinceLast} minutos`);

    if (finalStatus) {
      console.log('✅ Conversación detectada como terminada');
      
      // 5. Simular trigger automático de análisis batch
      console.log('\n🚀 Simulando trigger automático de análisis batch...');
      
      const startTime = Date.now();
      await BatchMemoryAnalysisService.analyzeConversation(testUserId, testAvatarId);
      const endTime = Date.now();
      
      console.log(`⏱️ Análisis batch completado en ${endTime - startTime}ms`);

      // 6. Verificar memorias creadas
      console.log('\n💾 Verificando memorias creadas automáticamente...');
      
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

      console.log(`📊 Memorias creadas automáticamente: ${memories.length}`);
      
      for (const memory of memories) {
        console.log(`   - [${memory.memoryOwner}] ${memory.category.name}: ${memory.memoryContent.substring(0, 50)}...`);
      }

      // 7. Verificar enriquecimiento
      console.log('\n🔄 Verificando enriquecimiento de memorias...');
      
      const userMemories = memories.filter(m => m.memoryOwner === 'user');
      const avatarMemories = memories.filter(m => m.memoryOwner === 'avatar');
      
      console.log(`📊 Distribución:`);
      console.log(`   - Memorias del usuario: ${userMemories.length}`);
      console.log(`   - Memorias del avatar: ${avatarMemories.length}`);

      // 8. Simular nueva conversación para verificar memoria
      console.log('\n🔄 Simulando nueva conversación para verificar memoria...');
      
      const newMessage = await prisma.message.create({
        data: {
          userId: testUserId,
          avatarId: testAvatarId,
          content: '¿Te acuerdas de que me gusta Queen?',
          isUser: true,
          tokensUsed: 0,
          createdAt: new Date()
        }
      });

      console.log('✅ Nuevo mensaje creado para verificar memoria');

      // Verificar que las memorias están disponibles
      const totalMemories = await prisma.userMemory.count({
        where: {
          userId: testUserId,
          avatarId: testAvatarId,
          isActive: true
        }
      });

      console.log(`📊 Total de memorias activas disponibles: ${totalMemories}`);

    } else {
      console.log('⚠️ Conversación aún no detectada como terminada');
    }

    console.log('\n✅ Prueba de flujo completo completada');

  } catch (error) {
    console.error('❌ Error en prueba de flujo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar prueba
testConversationFlow()
  .then(() => {
    console.log('🎉 Prueba de flujo completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en prueba de flujo:', error);
    process.exit(1);
  }); 