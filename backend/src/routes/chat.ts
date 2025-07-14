import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AIService, ChatContext, ConversationMemory } from '../services/aiService.js';

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

      // TODO: Obtener avatar desde base de datos
      const mockAvatar = avatarId ? {
        id: avatarId,
        name: avatarId === 'avatar_1' ? 'Luna' : 
              avatarId === 'avatar_2' ? 'Sofia' : 
              avatarId === 'avatar_3' ? 'Aria' : 
              avatarId === 'avatar_4' ? 'Venus' : 'Avatar',
        description: 'Un avatar atractivo y personalizado',
        personality: 'Amigable, atractiva, inteligente',
        imageUrl: `/api/avatars/${avatarId}/image`,
        isPremium: false,
        category: 'personalizado',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined;

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

      // Preparar contexto para Venice AI con memoria
      const chatContext: ChatContext = {
        avatar: mockAvatar,
        conversationHistory: history,
        userPreferences: context,
        conversationMemory: memory
      };

      console.log(`[DEBUG] Contexto completo enviado a Venice:`, JSON.stringify(chatContext, null, 2));

      // Generar respuesta con Venice AI
      const aiResponse = await AIService.generateChatResponse(message, chatContext);
      
      // TODO: Guardar mensaje y respuesta en base de datos
      
      return reply.send({
        success: true,
        message: aiResponse.message,
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}`,
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
      
      // TODO: Implementar obtención de historial desde base de datos
      // Por ahora, simulamos el historial
      
      const mockHistory = [
        {
          id: 'msg_1',
          message: 'Hola, ¿cómo estás?',
          isUser: true,
          timestamp: new Date(Date.now() - 60000).toISOString()
        },
        {
          id: 'msg_2',
          message: '¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?',
          isUser: false,
          timestamp: new Date(Date.now() - 30000).toISOString()
        }
      ];
      
      return reply.send({
        success: true,
        messages: mockHistory,
        total: mockHistory.length,
        hasMore: false
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
      
      // TODO: Implementar limpieza de historial en base de datos
      
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