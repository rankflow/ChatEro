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
      return avatar;
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
      const message = await prisma.message.create({
        data: {
          userId,
          content,
          isUser,
          avatarId,
          tokensUsed
        }
      });
      return message;
    } catch (error) {
      console.error('Error guardando mensaje:', error);
      return null;
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
        messages: messages.reverse(), // Ordenar cronológicamente
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
} 