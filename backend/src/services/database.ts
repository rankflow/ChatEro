import { PrismaClient } from '@prisma/client';
import { User, Avatar, Message, Token } from '../types/index.js';

const prisma = new PrismaClient();

export class DatabaseService {
  /**
   * Obtener usuario por ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      return user;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  /**
   * Obtener avatar por ID
   */
  static async getAvatarById(avatarId: string): Promise<Avatar | null> {
    try {
      const avatar = await prisma.avatar.findUnique({
        where: { id: avatarId }
      });
      return avatar as Avatar | null;
    } catch (error) {
      console.error('Error obteniendo avatar:', error);
      return null;
    }
  }

  /**
   * Obtener tokens del usuario
   */
  static async getUserTokens(userId: string): Promise<Token | null> {
    try {
      const token = await prisma.token.findFirst({
        where: { userId }
      });
      return token;
    } catch (error) {
      console.error('Error obteniendo tokens:', error);
      return null;
    }
  }

  /**
   * Consumir tokens del usuario
   */
  static async consumeTokens(userId: string, amount: number): Promise<boolean> {
    try {
      const token = await prisma.token.findFirst({
        where: { userId }
      });

      if (!token || token.amount < amount) {
        return false; // No hay suficientes tokens
      }

      await prisma.token.update({
        where: { id: token.id },
        data: { amount: token.amount - amount }
      });

      return true;
    } catch (error) {
      console.error('Error consumiendo tokens:', error);
      return false;
    }
  }

  /**
   * Guardar mensaje en la base de datos
   */
  static async saveMessage(
    userId: string,
    content: string,
    isUser: boolean,
    avatarId?: string,
    tokensUsed: number = 0
  ): Promise<Message | null> {
    try {
      // Manejar diferentes formatos de avatarId
      let realAvatarId = avatarId;
      
                    if (avatarId) {
        console.log(`[saveMessage] Procesando avatarId: ${avatarId}`);
        
        // Si es un ID de base de datos (formato cuid), verificar que existe
        if (avatarId.length > 20) { // IDs cuid son largos
          console.log(`[saveMessage] Buscando avatar por ID: ${avatarId}`);
          const avatar = await prisma.avatar.findUnique({
            where: { id: avatarId }
          });
          realAvatarId = avatar?.id || undefined;
          console.log(`[saveMessage] Avatar encontrado por ID: ${avatar?.name} (${avatar?.id})`);
        }
        // Si es del formato "avatar_aria", buscar el avatar real
        else if (avatarId.startsWith('avatar_')) {
          console.log(`[saveMessage] Buscando avatar por nombre: ${avatarId}`);
          const avatarName = avatarId.replace('avatar_', '');
          const avatar = await prisma.avatar.findFirst({
            where: { 
              name: avatarName.charAt(0).toUpperCase() + avatarName.slice(1)
            }
          });
          realAvatarId = avatar?.id || undefined;
          console.log(`[saveMessage] Avatar encontrado por nombre: ${avatar?.name} (${avatar?.id})`);
        }
      }
      
      console.log(`[saveMessage] realAvatarId final: ${realAvatarId}`);

      const messageData: any = {
        userId,
        content,
        isUser,
        tokensUsed
      };
      
      if (realAvatarId) {
        messageData.avatarId = realAvatarId;
      }
      
      console.log(`[saveMessage] Datos a guardar:`, JSON.stringify(messageData, null, 2));
      
      const message = await prisma.message.create({
        data: messageData
      });
      return message as Message;
    } catch (error) {
      console.error('Error guardando mensaje:', error);
      return null;
    }
  }

  /**
   * Obtener historial de mensajes por usuario y avatar con límite de tiempo
   */
  static async getMessageHistoryByAvatar(
    userId: string,
    avatarId: string,
    hoursLimit: number = 12,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ messages: Message[]; total: number }> {
    try {
      // Calcular fecha límite (12 horas atrás por defecto)
      const timeLimit = new Date(Date.now() - hoursLimit * 60 * 60 * 1000);
      
      console.log(`[DatabaseService] Obteniendo historial para usuario ${userId}, avatar ${avatarId}, desde ${timeLimit.toISOString()}`);
      
      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: { 
            userId,
            avatarId,
            createdAt: {
              gte: timeLimit // Solo mensajes de las últimas 12 horas
            }
          },
          orderBy: { createdAt: 'asc' }, // Orden cronológico para conversación
          take: limit,
          skip: offset,
          include: {
            avatar: true
          }
        }),
        prisma.message.count({
          where: { 
            userId,
            avatarId,
            createdAt: {
              gte: timeLimit
            }
          }
        })
      ]);

      console.log(`[DatabaseService] Encontrados ${messages.length} mensajes de las últimas ${hoursLimit} horas`);
      
      return {
        messages: messages as Message[],
        total
      };
    } catch (error) {
      console.error('Error obteniendo historial por avatar:', error);
      return { messages: [], total: 0 };
    }
  }

  /**
   * Obtener historial de mensajes del usuario
   */
  static async getMessageHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ messages: Message[]; total: number }> {
    try {
      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            avatar: true
          }
        }),
        prisma.message.count({
          where: { userId }
        })
      ]);

      return {
        messages: messages.reverse() as Message[], // Ordenar cronológicamente
        total
      };
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return { messages: [], total: 0 };
    }
  }

  /**
   * Limpiar historial de mensajes del usuario
   */
  static async clearMessageHistory(userId: string): Promise<boolean> {
    try {
      await prisma.message.deleteMany({
        where: { userId }
      });
      return true;
    } catch (error) {
      console.error('Error limpiando historial:', error);
      return false;
    }
  }

  /**
   * Crear o actualizar tokens del usuario
   */
  static async createOrUpdateTokens(userId: string, amount: number): Promise<Token | null> {
    try {
      const existingToken = await prisma.token.findFirst({
        where: { userId }
      });

      if (existingToken) {
        return await prisma.token.update({
          where: { id: existingToken.id },
          data: { amount: existingToken.amount + amount }
        });
      } else {
        return await prisma.token.create({
          data: {
            userId,
            amount
          }
        });
      }
    } catch (error) {
      console.error('Error creando/actualizando tokens:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario tiene suficientes tokens
   */
  static async hasEnoughTokens(userId: string, requiredAmount: number): Promise<boolean> {
    try {
      const token = await prisma.token.findFirst({
        where: { userId }
      });

      return token ? token.amount >= requiredAmount : false;
    } catch (error) {
      console.error('Error verificando tokens:', error);
      return false;
    }
  }

  /**
   * Guardar pago en la base de datos
   */
  static async savePayment(
    userId: string,
    amount: number,
    currency: string,
    status: string,
    stripeId?: string,
    description?: string,
    metadata?: any
  ): Promise<any> {
    try {
      const payment = await prisma.payment.create({
        data: {
          userId,
          amount,
          currency,
          status,
          stripeId,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });
      return payment;
    } catch (error) {
      console.error('Error guardando pago:', error);
      return null;
    }
  }

  /**
   * Obtener historial de pagos del usuario
   */
  static async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      const payments = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        createdAt: payment.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Error obteniendo historial de pagos:', error);
      return [];
    }
  }

  /**
   * Obtener todos los avatares desde la base de datos
   */
  static async getAllAvatars(): Promise<any[]> {
    try {
      const avatars = await prisma.avatar.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      return avatars;
    } catch (error) {
      console.error('Error obteniendo avatares:', error);
      return [];
    }
  }

  /**
   * Crear o actualizar avatar en la base de datos
   */
  static async createOrUpdateAvatar(avatarData: any): Promise<any> {
    try {
      const existingAvatar = await prisma.avatar.findFirst({
        where: { name: avatarData.name }
      });

      if (existingAvatar) {
        return await prisma.avatar.update({
          where: { id: existingAvatar.id },
          data: avatarData
        });
      } else {
        return await prisma.avatar.create({
          data: avatarData
        });
      }
    } catch (error) {
      console.error('Error creando/actualizando avatar:', error);
      return null;
    }
  }

  /**
   * Obtener mensajes no procesados para análisis batch
   */
  static async getUnprocessedMessages(userId: string, avatarId: string): Promise<Message[]> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          userId,
          avatarId,
          isProcessed: false
        },
        orderBy: { createdAt: 'asc' }
      });
      return messages as Message[];
    } catch (error) {
      console.error('Error obteniendo mensajes no procesados:', error);
      return [];
    }
  }

  /**
   * Marcar mensajes como procesados
   */
  static async markMessagesAsProcessed(messageIds: string[]): Promise<void> {
    try {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds }
        },
        data: {
          isProcessed: true
        }
      });
    } catch (error) {
      console.error('Error marcando mensajes como procesados:', error);
    }
  }

  /**
   * Obtener timestamp del último batch
   */
  static async getLastBatchTime(userId: string, avatarId: string): Promise<Date | null> {
    try {
      const lastBatch = await prisma.batchAnalysis.findFirst({
        where: {
          userId,
          avatarId
        },
        orderBy: { createdAt: 'desc' }
      });
      return lastBatch?.createdAt || null;
    } catch (error) {
      console.error('Error obteniendo último batch:', error);
      return null;
    }
  }

  /**
   * Actualizar timestamp del último batch
   */
  static async updateLastBatchTime(userId: string, avatarId: string): Promise<void> {
    try {
      await prisma.batchAnalysis.create({
        data: {
          userId,
          avatarId,
          status: 'completed'
        }
      });
    } catch (error) {
      console.error('Error actualizando último batch:', error);
    }
  }

  /**
   * Guardar memoria de usuario
   */
  static async saveUserMemory(memoryData: {
    userId: string;
    avatarId: string;
    memoryType: string;
    memoryKey: string;
    categoryId: number;
    memoryContent: string;
    memoryVector: string;
    memoryOwner: string;
    source: string;
    tags?: string;
  }): Promise<void> {
    try {
      await prisma.userMemory.create({
        data: {
          userId: memoryData.userId,
          avatarId: memoryData.avatarId,
          memoryType: memoryData.memoryType,
          memoryKey: memoryData.memoryKey,
          categoryId: memoryData.categoryId,
          memoryContent: memoryData.memoryContent,
          memoryVector: memoryData.memoryVector,
          memoryOwner: memoryData.memoryOwner,
          source: memoryData.source,
          tags: memoryData.tags
        }
      });
    } catch (error) {
      console.error('Error guardando memoria de usuario:', error);
      throw error;
    }
  }
} 