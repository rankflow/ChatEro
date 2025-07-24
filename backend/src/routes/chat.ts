import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AIService, ChatContext, ConversationMemory } from '../services/aiService.js';
import { AvatarExtendedMemoryService } from '../services/avatarExtendedMemory.js';
import { AvatarSyncService } from '../services/avatarSyncService.js';
import { DatabaseService } from '../services/database.js';
import MemoryService from '../services/memoryService.js';
import ConversationAnalysisService from '../services/conversationAnalysisService.js';
import { BatchMemoryAnalysisService } from '../services/batchMemoryAnalysisService.js';
import { ConversationEndDetectionService } from '../services/conversationEndDetectionService.js';

// Esquemas de validación
const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  avatarId: z.string().optional(),
  context: z.string().optional(),
  incognitoMode: z.boolean().optional(),
  conversationMemory: z.object({
    summary: z.string().optional(),
    turnCount: z.number().optional(),
    lastUpdated: z.string().optional(),
    userRevelations: z.array(z.string()).optional(),
    dominantTone: z.string().optional(),
    avatarIntroduced: z.boolean().optional(),
    boundariesDiscussed: z.array(z.string()).optional(),
    fantasiesExplored: z.array(z.string()).optional()
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional()
});

export default async function chatRoutes(fastify: FastifyInstance) {
  // Enviar mensaje al chat
  fastify.post('/message', {
    schema: {
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', minLength: 1, maxLength: 1000 },
          avatarId: { type: 'string' },
          context: { type: 'string' },
          incognitoMode: { type: 'boolean' },
          conversationMemory: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              turnCount: { type: 'number' },
              lastUpdated: { type: 'string' },
              userRevelations: { type: 'array', items: { type: 'string' } },
              dominantTone: { type: 'string' },
              avatarIntroduced: { type: 'boolean' },
              boundariesDiscussed: { type: 'array', items: { type: 'string' } },
              fantasiesExplored: { type: 'array', items: { type: 'string' } }
            }
          },
          conversationHistory: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                content: { type: 'string' }
              }
            }
          }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { message, avatarId, context, conversationMemory, conversationHistory, incognitoMode = false } = chatMessageSchema.parse(request.body);
      const userId = (request.user as any)?.userId;
      
      console.log(`[DEBUG] Modo incógnito: ${incognitoMode}`);
      
      // Validación de contenido desactivada temporalmente

      // Obtener avatar desde datos sincronizados
      let avatar = undefined;
      if (avatarId) {
        // Extraer el nombre del avatar del ID (ej: "avatar_aria" -> "aria")
        const avatarName = avatarId.replace('avatar_', '');
        
        // Obtener datos sincronizados del avatar
        const syncedData = await AvatarSyncService.getSyncedAvatarData(avatarName);
        
        if (syncedData) {
          avatar = {
            id: syncedData.id,
            name: syncedData.name,
            description: syncedData.fullBackground || syncedData.description,
            personality: syncedData.fullPersonality || syncedData.personality,
            imageUrl: syncedData.imageUrl,
            isPremium: syncedData.isPremium,
            category: syncedData.category,
            isActive: syncedData.isActive,
            createdAt: syncedData.createdAt,
            updatedAt: syncedData.updatedAt
          };
        } else {
          // Si no hay datos sincronizados, sincronizar primero
          console.log(`[CHAT] Sincronizando avatar ${avatarName} para obtener datos...`);
          const newSyncedData = await AvatarSyncService.syncAvatar(avatarName);
          
          if (newSyncedData) {
            avatar = {
              id: newSyncedData.id,
              name: newSyncedData.name,
              description: newSyncedData.fullBackground || newSyncedData.description,
              personality: newSyncedData.fullPersonality || newSyncedData.personality,
              imageUrl: newSyncedData.imageUrl,
              isPremium: newSyncedData.isPremium,
              category: newSyncedData.category,
              isActive: newSyncedData.isActive,
              createdAt: newSyncedData.createdAt,
              updatedAt: newSyncedData.updatedAt
            };
          }
        }
      }

      // Usar historial recibido del frontend o crear uno vacío
      const history = conversationHistory || [];
      
      console.log(`[DEBUG] Historial recibido: ${history.length} mensajes`);
      console.log(`[DEBUG] Historial completo:`, JSON.stringify(history, null, 2));
      console.log(`[DEBUG] Avatar seleccionado:`, avatarId);

      // Convertir memoria del frontend al formato del backend
      let memory: ConversationMemory | undefined;
      if (conversationMemory && Object.keys(conversationMemory).length > 0) {
        memory = {
          summary: conversationMemory.summary || '',
          turnCount: conversationMemory.turnCount || 0,
          lastUpdated: conversationMemory.lastUpdated ? new Date(conversationMemory.lastUpdated) : new Date(),
          userRevelations: conversationMemory.userRevelations || [],
          dominantTone: conversationMemory.dominantTone || 'neutral',
          avatarIntroduced: conversationMemory.avatarIntroduced || false,
          boundariesDiscussed: conversationMemory.boundariesDiscussed || [],
          fantasiesExplored: conversationMemory.fantasiesExplored || []
        };
      }
      
      console.log(`[DEBUG] Memoria recibida:`, memory ? 'Sí' : 'No');
      if (memory) {
        console.log(`[DEBUG] Memoria completa:`, JSON.stringify(memory, null, 2));
      }

      // --- INTEGRACIÓN MEMORIA EXTENDIDA ---
      let extraFicha = '';
      if (avatarId && message) {
        console.log(`[DEBUG] Buscando dato en memoria extendida para avatar: ${avatarId}`);
        console.log(`[DEBUG] Mensaje del usuario: "${message}"`);
        
        // Buscar dato relevante en la memoria extendida
        const fichaDato = await AvatarExtendedMemoryService.getAvatarDetail(avatarId, message);
        if (fichaDato) {
          extraFicha = `\nDato de ficha: ${avatar?.name || avatarId} ${fichaDato}`;
          console.log(`[DEBUG] ✅ Dato encontrado en memoria extendida: ${fichaDato}`);
          console.log(`[DEBUG] Añadiendo al contexto: ${extraFicha}`);
        } else {
          console.log(`[DEBUG] ❌ No se encontró dato relevante en memoria extendida`);
        }
      } else {
        console.log(`[DEBUG] No se puede buscar en memoria extendida - avatarId: ${avatarId}, message: ${message ? 'Sí' : 'No'}`);
      }
      // --- FIN INTEGRACIÓN ---

      // --- INTEGRACIÓN MEMORIA VECTORIAL ---
      let memoryContext = '';
      if (avatarId && message && !incognitoMode) {
        try {
          console.log(`[MEMORY] Buscando memorias relevantes para usuario ${userId}, avatar ${avatarId}`);
          
          // Buscar memorias relevantes del usuario con este avatar
          const relevantMemories = await MemoryService.searchMemories(userId, avatarId, message, 3);
          
          if (relevantMemories.length > 0) {
            console.log(`[MEMORY] ✅ Encontradas ${relevantMemories.length} memorias relevantes`);
            
            // Crear contexto de memoria para la IA
            const memoryTexts = relevantMemories.map(memory => 
              `[Memoria ${memory.memoryType}]: ${memory.memoryContent} (confianza: ${memory.confidence.toFixed(2)})`
            );
            
            memoryContext = `\n\n--- MEMORIAS RELEVANTES DEL USUARIO ---\n${memoryTexts.join('\n')}\n--- FIN MEMORIAS ---\n`;
            
            console.log(`[MEMORY] Contexto de memoria añadido: ${memoryContext.length} caracteres`);
          } else {
            console.log(`[MEMORY] ❌ No se encontraron memorias relevantes`);
          }
        } catch (error) {
          console.error(`[MEMORY] Error buscando memorias:`, error);
          // Continuar sin memoria en caso de error
        }
      } else {
        console.log(`[MEMORY] No se busca memoria - incognitoMode: ${incognitoMode}, avatarId: ${avatarId}`);
      }
      // --- FIN INTEGRACIÓN MEMORIA VECTORIAL ---

      // Preparar contexto para Venice AI con memoria
      console.log(`[DEBUG] Avatar antes del contexto:`, avatar ? `ID: ${avatar.id}, Name: ${avatar.name}` : 'undefined');
      
      const chatContext: ChatContext = {
        avatar: avatar,
        conversationHistory: history,
        userPreferences: context,
        conversationMemory: memory
      };
      
      console.log(`[DEBUG] Contexto creado con avatar:`, chatContext.avatar ? `ID: ${chatContext.avatar.id}` : 'undefined');

      // Añadir dato de ficha al contexto si se encontró
      if (extraFicha) {
        chatContext.conversationHistory = [
          ...(chatContext.conversationHistory || []),
          { role: 'system', content: extraFicha }
        ];
      }

      // Añadir contexto de memoria al historial si se encontró
      if (memoryContext) {
        chatContext.conversationHistory = [
          ...(chatContext.conversationHistory || []),
          { role: 'system', content: memoryContext }
        ];
      }

      console.log(`[DEBUG] Contexto completo enviado a Venice:`, JSON.stringify(chatContext, null, 2));

      // Generar respuesta con Venice AI
      const aiResponse = await AIService.generateChatResponse(message, chatContext);
      
      // Guardar mensajes solo si NO está en modo incógnito
      let userMessage = null;
      let aiMessage = null;
      
      if (!incognitoMode) {
        // Guardar mensaje del usuario en base de datos
        userMessage = await DatabaseService.saveMessage(
          userId,
          message,
          true,
          avatarId,
          0 // Los mensajes del usuario no consumen tokens
        );

        // Guardar embedding del mensaje del usuario
        if (userMessage && avatarId) {
          try {
            await MemoryService.saveConversationEmbedding(
              userId,
              avatarId,
              message,
              'user',
              undefined, // sessionId se puede añadir después
              userMessage.id
            );
            console.log(`[MEMORY] ✅ Embedding del mensaje del usuario guardado`);
          } catch (error) {
            console.error(`[MEMORY] Error guardando embedding del usuario:`, error);
          }
        }

        // Guardar respuesta de la IA en base de datos
        aiMessage = await DatabaseService.saveMessage(
          userId,
          aiResponse.message,
          false,
          avatarId,
          aiResponse.tokensUsed
        );

        // Guardar embedding de la respuesta de la IA
        if (aiMessage && avatarId) {
          try {
            await MemoryService.saveConversationEmbedding(
              userId,
              avatarId,
              aiResponse.message,
              'avatar',
              undefined, // sessionId se puede añadir después
              aiMessage.id
            );
            console.log(`[MEMORY] ✅ Embedding de la respuesta de la IA guardado`);
          } catch (error) {
            console.error(`[MEMORY] Error guardando embedding de la IA:`, error);
          }
        }

        // Analizar conversación para extraer información relevante
        if (avatarId) {
          try {
            console.log(`[ANALYSIS] Iniciando análisis de conversación...`);
            
            const analysisResult = await ConversationAnalysisService.analyzeConversation(
              userId,
              avatarId,
              message,
              aiResponse.message,
              context // Usar la variable context que ya está disponible
            );
            
            if (analysisResult.newMemories > 0) {
              console.log(`[ANALYSIS] ✅ Análisis completado - ${analysisResult.newMemories} nuevas memorias creadas en ${analysisResult.analysisTime}ms`);
            } else {
              console.log(`[ANALYSIS] ✅ Análisis completado - No se encontró información relevante en ${analysisResult.analysisTime}ms`);
            }
          } catch (error) {
            console.error(`[ANALYSIS] Error analizando conversación:`, error);
          }
        }

        // Consumir tokens si la respuesta fue exitosa
        if (aiMessage && aiResponse.tokensUsed > 0) {
          const tokensConsumed = await DatabaseService.consumeTokens(userId, aiResponse.tokensUsed);
          if (!tokensConsumed) {
            console.warn(`[WARNING] No se pudieron consumir ${aiResponse.tokensUsed} tokens para usuario ${userId}`);
          }
        }

        // --- DETECCIÓN DE FIN DE CONVERSACIÓN Y ANÁLISIS BATCH ---
        if (avatarId) {
          try {
            console.log(`[BATCH] Verificando si la conversación ha terminado...`);
            
            // Verificar si la conversación ha terminado
            const conversationEnded = await ConversationEndDetectionService.detectConversationEnd(userId, avatarId);
            
            if (conversationEnded) {
              console.log(`[BATCH] ✅ Conversación terminada - Iniciando análisis batch...`);
              
              // Ejecutar análisis batch de forma asíncrona (no bloquear la respuesta)
              setImmediate(async () => {
                try {
                  await BatchMemoryAnalysisService.analyzeConversation(userId, avatarId);
                  console.log(`[BATCH] ✅ Análisis batch completado para usuario ${userId} y avatar ${avatarId}`);
                } catch (error) {
                  console.error(`[BATCH] ❌ Error en análisis batch:`, error);
                }
              });
              
              console.log(`[BATCH] Análisis batch programado para ejecución asíncrona`);
            } else {
              console.log(`[BATCH] Conversación aún activa - No se ejecuta análisis batch`);
            }
          } catch (error) {
            console.error(`[BATCH] Error verificando fin de conversación:`, error);
          }
        }
      } else {
        console.log(`[DEBUG] Modo incógnito activado - No se guardan mensajes en BD`);
      }
      
      return reply.send({
        success: true,
        message: aiResponse.message,
        timestamp: new Date().toISOString(),
        messageId: aiMessage?.id || `msg_${Date.now()}`,
        tokensUsed: aiResponse.tokensUsed,
        conversationMemory: memory // Devolver memoria actualizada
      });
    } catch (error) {
      fastify.log.error(error);
      
      // Si hay error con Venice, devolver respuesta de fallback
      if (error instanceof Error && error.message.includes('Venice')) {
        return reply.status(503).send({
          success: false,
          message: 'El servicio de IA está temporalmente no disponible. Por favor, intenta de nuevo en unos momentos.',
          error: 'Venice service unavailable'
        });
      }
      
      return reply.status(400).send({
        success: false,
        message: 'Error al procesar el mensaje',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener estado actual de la conversación (para debug)
  fastify.get('/debug', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.userId;
      
      // Por ahora devolvemos información de debug
      return reply.send({
        success: true,
        debug: {
          message: 'Endpoint de debug para consultar estado de conversación',
          timestamp: new Date().toISOString(),
          userId: userId,
          note: 'Los logs detallados aparecen en la consola del backend'
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error obteniendo debug info',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener historial de chat
  fastify.get('/history', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { limit = 50, offset = 0 } = request.query as any;
      const userId = (request.user as any)?.userId;
      
      // Obtener historial real desde base de datos
      const { messages, total } = await DatabaseService.getMessageHistory(userId, limit, offset);
      
      // Formatear mensajes para el frontend
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        message: msg.content,
        isUser: msg.isUser,
        timestamp: msg.createdAt.toISOString(),
        tokensUsed: msg.tokensUsed,
        avatarId: msg.avatarId
      }));
      
      return reply.send({
        success: true,
        messages: formattedMessages,
        total,
        hasMore: total > offset + limit
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error al obtener el historial',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Limpiar historial de chat
  fastify.delete('/history', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.userId;
      
      // Limpiar historial real desde base de datos
      const success = await DatabaseService.clearMessageHistory(userId);
      
      if (!success) {
        return reply.status(500).send({
          success: false,
          message: 'Error al limpiar el historial'
        });
      }
      
      return reply.send({
        success: true,
        message: 'Historial limpiado exitosamente'
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error al limpiar el historial',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Ejecutar análisis batch manualmente
  fastify.post('/batch-analyze', {
    schema: {
      body: {
        type: 'object',
        required: ['avatarId'],
        properties: {
          avatarId: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { avatarId } = request.body as any;
      const userId = (request.user as any)?.userId;
      
      console.log(`[BATCH] Análisis batch manual solicitado para usuario ${userId} y avatar ${avatarId}`);
      
      // Ejecutar análisis batch
      await BatchMemoryAnalysisService.analyzeConversation(userId, avatarId);
      
      return reply.send({
        success: true,
        message: 'Análisis batch completado exitosamente',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error ejecutando análisis batch',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener estado de conversación
  fastify.get('/conversation-status', {
    schema: {
      querystring: {
        type: 'object',
        required: ['avatarId'],
        properties: {
          avatarId: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { avatarId } = request.query as any;
      const userId = (request.user as any)?.userId;
      
      // Verificar si la conversación ha terminado
      const conversationEnded = await ConversationEndDetectionService.detectConversationEnd(userId, avatarId);
      const timeSinceLastMessage = await ConversationEndDetectionService.getTimeSinceLastMessage(userId, avatarId);
      const conversationDuration = await ConversationEndDetectionService.getConversationDuration(userId, avatarId);
      
      return reply.send({
        success: true,
        conversationEnded,
        timeSinceLastMessage, // en minutos
        conversationDuration, // en minutos
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        message: 'Error obteniendo estado de conversación',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
} 