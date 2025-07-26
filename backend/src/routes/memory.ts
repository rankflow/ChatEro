import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import MemoryService from '../services/memoryService.js';

interface SearchMemoriesRequest {
  Params: {
    avatarId: string;
  };
  Body: {
    context: string;
    limit?: number;
  };
}

interface SaveMemoryRequest {
  Params: {
    avatarId: string;
  };
  Body: {
    memoryType: string;
    memoryContent: string;
    memoryKey?: string;
    confidence?: number;
  };
}



interface ConsolidateMemoriesRequest {
  Body: {
    userId: string;
  };
}

interface GenerateSessionSummaryRequest {
  Params: {
    avatarId: string;
  };
  Body: {
    sessionId: string;
    sessionMessages: string[];
  };
}

interface GetMemoryStatsRequest {
  Params: {
    userId: string;
  };
}

export default async function memoryRoutes(fastify: FastifyInstance) {
  
  // Buscar memorias relevantes
  fastify.post<SearchMemoriesRequest>(
    '/memory/search/:avatarId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            avatarId: { type: 'string' }
          },
          required: ['avatarId']
        },
        body: {
          type: 'object',
          properties: {
            context: { type: 'string' },
            limit: { type: 'number', default: 5 }
          },
          required: ['context']
        }
      }
    },
    async (request: FastifyRequest<SearchMemoriesRequest>, reply: FastifyReply) => {
      try {
        const { avatarId } = request.params;
        const { context, limit = 5 } = request.body;
        
        // Obtener userId del token JWT
        const userId = (request as any).user?.id;
        if (!userId) {
          return reply.status(401).send({ error: 'Usuario no autenticado' });
        }

        console.log(`[Memory API] Buscando memorias para usuario ${userId}, avatar ${avatarId}`);
        
        const memories = await MemoryService.searchMemories(userId, avatarId, context, limit);
        
        return reply.send({
          success: true,
          data: {
            memories,
            count: memories.length,
            context,
            avatarId
          }
        });

      } catch (error) {
        console.error('[Memory API] Error buscando memorias:', error);
        return reply.status(500).send({ 
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  );

  // Guardar nueva memoria
  fastify.post<SaveMemoryRequest>(
    '/memory/save/:avatarId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            avatarId: { type: 'string' }
          },
          required: ['avatarId']
        },
        body: {
          type: 'object',
          properties: {
            memoryType: { type: 'string' },
            memoryContent: { type: 'string' },
            memoryKey: { type: 'string' },
            confidence: { type: 'number', minimum: 0, maximum: 1, default: 0.5 }
          },
          required: ['memoryType', 'memoryContent']
        }
      }
    },
    async (request: FastifyRequest<SaveMemoryRequest>, reply: FastifyReply) => {
      try {
        const { avatarId } = request.params;
        const { memoryType, memoryContent, memoryKey, confidence = 0.5 } = request.body;
        
        // Obtener userId del token JWT
        const userId = (request as any).user?.id;
        if (!userId) {
          return reply.status(401).send({ error: 'Usuario no autenticado' });
        }

        console.log(`[Memory API] Guardando memoria tipo: ${memoryType} para usuario ${userId}`);
        
        await MemoryService.saveMemory(
          userId,
          avatarId,
          memoryType,
          memoryContent,
          memoryKey,
          confidence
        );
        
        return reply.send({
          success: true,
          message: 'Memoria guardada exitosamente',
          data: {
            memoryType,
            avatarId,
            userId
          }
        });

      } catch (error) {
        console.error('[Memory API] Error guardando memoria:', error);
        return reply.status(500).send({ 
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  );



  // Consolidar memorias
  fastify.post<ConsolidateMemoriesRequest>(
    '/memory/consolidate',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' }
          },
          required: ['userId']
        }
      }
    },
    async (request: FastifyRequest<ConsolidateMemoriesRequest>, reply: FastifyReply) => {
      try {
        const { userId } = request.body;
        
        // Verificar que el usuario autenticado coincide
        const authenticatedUserId = (request as any).user?.id;
        if (!authenticatedUserId || authenticatedUserId !== userId) {
          return reply.status(401).send({ error: 'Usuario no autorizado' });
        }

        console.log(`[Memory API] Consolidando memorias para usuario ${userId}`);
        
        const result = await MemoryService.consolidateMemories(userId);
        
        return reply.send({
          success: true,
          message: 'Memorias consolidadas exitosamente',
          data: result
        });

      } catch (error) {
        console.error('[Memory API] Error consolidando memorias:', error);
        return reply.status(500).send({ 
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  );

  // Generar resumen de sesión
  fastify.post<GenerateSessionSummaryRequest>(
    '/memory/session-summary/:avatarId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            avatarId: { type: 'string' }
          },
          required: ['avatarId']
        },
        body: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            sessionMessages: { 
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['sessionId', 'sessionMessages']
        }
      }
    },
    async (request: FastifyRequest<GenerateSessionSummaryRequest>, reply: FastifyReply) => {
      try {
        const { avatarId } = request.params;
        const { sessionId, sessionMessages } = request.body;
        
        // Obtener userId del token JWT
        const userId = (request as any).user?.id;
        if (!userId) {
          return reply.status(401).send({ error: 'Usuario no autenticado' });
        }

        console.log(`[Memory API] Generando resumen de sesión ${sessionId}`);
        
        await MemoryService.generateSessionSummary(
          userId,
          avatarId,
          sessionId,
          sessionMessages
        );
        
        return reply.send({
          success: true,
          message: 'Resumen de sesión generado exitosamente',
          data: {
            sessionId,
            avatarId,
            messageCount: sessionMessages.length
          }
        });

      } catch (error) {
        console.error('[Memory API] Error generando resumen de sesión:', error);
        return reply.status(500).send({ 
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  );

  // Obtener estadísticas de memoria
  fastify.get<GetMemoryStatsRequest>(
    '/memory/stats/:userId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            userId: { type: 'string' }
          },
          required: ['userId']
        }
      }
    },
    async (request: FastifyRequest<GetMemoryStatsRequest>, reply: FastifyReply) => {
      try {
        const { userId } = request.params;
        
        // Verificar que el usuario autenticado coincide
        const authenticatedUserId = (request as any).user?.id;
        if (!authenticatedUserId || authenticatedUserId !== userId) {
          return reply.status(401).send({ error: 'Usuario no autorizado' });
        }

        console.log(`[Memory API] Obteniendo estadísticas para usuario ${userId}`);
        
        const stats = await MemoryService.getMemoryStats(userId);
        
        return reply.send({
          success: true,
          data: stats
        });

      } catch (error) {
        console.error('[Memory API] Error obteniendo estadísticas:', error);
        return reply.status(500).send({ 
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  );

  // Ruta de prueba para verificar el estado del servicio
  fastify.get('/memory/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return reply.send({
        success: true,
        message: 'Memory service is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    } catch (error) {
      console.error('[Memory API] Health check error:', error);
      return reply.status(500).send({ 
        error: 'Service unhealthy',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
} 