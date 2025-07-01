import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { MistralService, ChatContext } from '../services/mistral.js';

// Esquemas de validación
const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  avatarId: z.string().optional(),
  context: z.string().optional()
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
          context: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { message, avatarId, context } = chatMessageSchema.parse(request.body);
      const userId = request.user?.userId;
      
      // Validar contenido del usuario
      const contentValidation = await MistralService.validateContent(message);
      if (!contentValidation.isValid) {
        return reply.status(400).send({
          success: false,
          message: 'Tu mensaje contiene contenido no permitido. Por favor, reformula tu mensaje.',
          error: contentValidation.reason
        });
      }

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

      // TODO: Obtener historial de conversación desde base de datos
      const conversationHistory = [
        // Aquí se cargaría el historial real desde la base de datos
      ];

      // Preparar contexto para Mistral
      const chatContext: ChatContext = {
        avatar: mockAvatar,
        conversationHistory,
        userPreferences: context
      };

      // Generar respuesta con Mistral
      const aiResponse = await MistralService.generateChatResponse(message, chatContext);
      
      // TODO: Guardar mensaje y respuesta en base de datos
      
      return reply.send({
        success: true,
        message: aiResponse.message,
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}`,
        tokensUsed: aiResponse.tokensUsed
      });
    } catch (error) {
      fastify.log.error(error);
      
      // Si hay error con Mistral, devolver respuesta de fallback
      if (error instanceof Error && error.message.includes('Mistral')) {
        return reply.status(503).send({
          success: false,
          message: 'El servicio de IA está temporalmente no disponible. Por favor, intenta de nuevo en unos momentos.',
          error: 'Mistral service unavailable'
        });
      }
      
      return reply.status(400).send({
        success: false,
        message: 'Error al procesar el mensaje',
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
      const userId = request.user?.userId;
      
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
      const userId = request.user?.userId;
      
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