import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CharacterDevelopmentService } from '../services/characterDevelopment';
import { AvatarExtendedMemoryService } from '../services/avatarExtendedMemory';
import { AvatarSyncService } from '../services/avatarSyncService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function avatarRoutes(fastify: FastifyInstance) {
  // Obtener lista de avatares disponibles
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Primero, sincronizar todos los avatares para asegurar datos actualizados
      console.log('[AVATARS] Sincronizando avatares antes de obtener lista...');
      const syncedAvatars = await AvatarSyncService.syncAllAvatars();
      
      // Convertir datos sincronizados al formato esperado por el frontend
      const avatars = syncedAvatars.map(syncedData => ({
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
      }));
      
      return reply.send({
        success: true,
        avatars,
        total: avatars.length
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener avatares',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener avatar específico
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      // Extraer el nombre del avatar del ID (ej: "avatar_aria" -> "aria")
      const avatarName = id.replace('avatar_', '');
      
      // Obtener datos sincronizados del avatar
      const syncedData = AvatarSyncService.getSyncedAvatarData(avatarName);
      
      if (!syncedData) {
        // Si no hay datos sincronizados, sincronizar primero
        console.log(`[AVATARS] Sincronizando avatar ${avatarName} para obtener datos...`);
        const newSyncedData = await AvatarSyncService.syncAvatar(avatarName);
        
        if (!newSyncedData) {
          return reply.status(404).send({
            success: false,
            message: `No se encontró avatar ${id}`
          });
        }
        
        return reply.send({
          success: true,
          avatar: {
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
          }
        });
      }

      return reply.send({
        success: true,
        avatar: {
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
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener avatar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener imagen del avatar
  fastify.get('/:id/image', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      // TODO: Implementar obtención de imagen desde base de datos o sistema de archivos
      const mockImageUrl = `https://via.placeholder.com/400x600/FF69B4/FFFFFF?text=${encodeURIComponent(id)}`;
      
      return reply.redirect(mockImageUrl);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener imagen del avatar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Generar perfil de personaje usando IA
  fastify.post('/generate-profile', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, basePersonality, category } = request.body as {
        name: string;
        basePersonality: string;
        category: string;
      };

      if (!name || !basePersonality || !category) {
        return reply.status(400).send({
          success: false,
          message: 'Faltan campos requeridos: name, basePersonality, category'
        });
      }

      // Generar perfil completo usando IA
      const characterProfile = await CharacterDevelopmentService.generateCharacterProfile(
        name,
        basePersonality,
        category
      );

      // Generar descripción mejorada
      const enhancedDescription = await CharacterDevelopmentService.generateEnhancedDescription(characterProfile);

      return reply.send({
        success: true,
        profile: {
          ...characterProfile,
          description: enhancedDescription
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error generando perfil de personaje',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener perfil detallado de un avatar
  fastify.get('/:id/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      // Extraer el nombre del avatar del ID (ej: "avatar_aria" -> "aria")
      const avatarName = id.replace('avatar_', '');
      
      // Obtener datos sincronizados del avatar
      const syncedData = AvatarSyncService.getSyncedAvatarData(avatarName);
      
      if (!syncedData) {
        // Si no hay datos sincronizados, sincronizar primero
        console.log(`[AVATARS] Sincronizando avatar ${avatarName} para obtener perfil...`);
        const newSyncedData = await AvatarSyncService.syncAvatar(avatarName);
        
        if (!newSyncedData) {
          return reply.status(404).send({
            success: false,
            message: `No se encontró perfil para el avatar ${id}`
          });
        }
        
        return reply.send({
          success: true,
          profile: newSyncedData
        });
      }

      return reply.send({
        success: true,
        profile: syncedData
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener perfil del avatar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Nuevo endpoint: Obtener detalle específico del avatar (memoria extendida)
  fastify.get('/:id/detail', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { intent } = request.query as { intent: string };

      if (!intent) {
        return reply.status(400).send({
          success: false,
          message: 'Falta el parámetro "intent"'
        });
      }

      // Obtener detalle usando el servicio de memoria extendida
      const detail = AvatarExtendedMemoryService.getAvatarDetail(id, intent);

      if (!detail) {
        return reply.status(404).send({
          success: false,
          message: `No se encontró información para "${intent}" en el avatar ${id}`
        });
      }

      return reply.send({
        success: true,
        avatarId: id,
        intent: intent,
        detail: detail
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener detalle del avatar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Nuevo endpoint: Obtener todos los datos extendidos del avatar
  fastify.get('/:id/extended', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      // Obtener todos los datos extendidos
      const extendedData = AvatarExtendedMemoryService.getAvatarFullData(id);

      if (!extendedData) {
        return reply.status(404).send({
          success: false,
          message: `No se encontraron datos extendidos para el avatar ${id}`
        });
      }

      return reply.send({
        success: true,
        avatarId: id,
        data: extendedData
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener datos extendidos del avatar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Nuevo endpoint: Sincronizar avatares
  fastify.post('/sync', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { avatarName } = request.body as { avatarName?: string };

      if (avatarName) {
        // Sincronizar un avatar específico
        const syncedData = await AvatarSyncService.syncAvatar(avatarName);
        
        if (!syncedData) {
          return reply.status(404).send({
            success: false,
            message: `No se pudo sincronizar el avatar ${avatarName}`
          });
        }

        return reply.send({
          success: true,
          message: `Avatar ${avatarName} sincronizado correctamente`,
          avatar: syncedData
        });
      } else {
        // Sincronizar todos los avatares
        const syncedAvatars = await AvatarSyncService.syncAllAvatars();
        
        return reply.send({
          success: true,
          message: `${syncedAvatars.length} avatares sincronizados correctamente`,
          avatars: syncedAvatars
        });
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error durante la sincronización',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Nuevo endpoint: Obtener datos sincronizados de un avatar
  fastify.get('/:id/synced', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      // Extraer el nombre del avatar del ID (ej: "avatar_aria" -> "aria")
      const avatarName = id.replace('avatar_', '');
      
      const syncedData = AvatarSyncService.getSyncedAvatarData(avatarName);
      
      if (!syncedData) {
        return reply.status(404).send({
          success: false,
          message: `No se encontraron datos sincronizados para el avatar ${id}`
        });
      }

      return reply.send({
        success: true,
        avatarId: id,
        data: syncedData
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener datos sincronizados del avatar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
} 