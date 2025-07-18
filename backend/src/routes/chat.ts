import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AIService, ChatContext, ConversationMemory } from '../services/aiService.js';
import { AvatarExtendedMemoryService } from '../services/avatarExtendedMemory.js';
import { AvatarSyncService } from '../services/avatarSyncService.js';
import { DatabaseService } from '../services/database.js';

// Esquemas de validación
const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  avatarId: z.string().optional(),
  context: z.string().optional(),
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
      const { message, avatarId, context, conversationMemory, conversationHistory } = chatMessageSchema.parse(request.body);
      const userId = (request.user as any)?.userId;
      
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

      console.log(`[DEBUG] Contexto completo enviado a Venice:`, JSON.stringify(chatContext, null, 2));

      // Generar respuesta con Venice AI
      const aiResponse = await AIService.generateChatResponse(message, chatContext);
      
      // Guardar mensaje del usuario en base de datos
      const userMessage = await DatabaseService.saveMessage(
        userId,
        message,
        true,
        avatarId,
        0 // Los mensajes del usuario no consumen tokens
      );

      // Guardar respuesta de la IA en base de datos
      const aiMessage = await DatabaseService.saveMessage(
        userId,
        aiResponse.message,
        false,
        avatarId,
        aiResponse.tokensUsed
      );

      // Consumir tokens si la respuesta fue exitosa
      if (aiMessage && aiResponse.tokensUsed > 0) {
        const tokensConsumed = await DatabaseService.consumeTokens(userId, aiResponse.tokensUsed);
        if (!tokensConsumed) {
          console.warn(`[WARNING] No se pudieron consumir ${aiResponse.tokensUsed} tokens para usuario ${userId}`);
        }
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
} 