import { PrismaClient, Message } from '@prisma/client';
import { BatchMemoryAnalysisService } from './batchMemoryAnalysisService.js';

interface BufferedMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  userId: string;
  avatarId: string;
}

interface ConversationBuffer {
  userId: string;
  avatarId: string;
  messages: BufferedMessage[];
  lastActivity: Date;
  isActive: boolean;
}

export class ConversationBufferService {
  private static buffers = new Map<string, ConversationBuffer>();
  private static readonly BUFFER_TIMEOUT = 5 * 60 * 1000; // 5 minutos
  private static readonly MAX_BUFFER_SIZE = 50; // Máximo 50 mensajes por buffer
  private static readonly MIN_MESSAGES_FOR_ANALYSIS = 3; // Mínimo 3 mensajes para analizar

  /**
   * Añade un mensaje al buffer de conversación
   */
  static addMessage(
    userId: string,
    avatarId: string,
    messageId: string,
    content: string,
    isUser: boolean
  ): void {
    const bufferKey = this.getBufferKey(userId, avatarId);
    
    // Crear buffer si no existe
    if (!this.buffers.has(bufferKey)) {
      this.buffers.set(bufferKey, {
        userId,
        avatarId,
        messages: [],
        lastActivity: new Date(),
        isActive: true
      });
    }

    const buffer = this.buffers.get(bufferKey)!;
    
    // Añadir mensaje al buffer
    buffer.messages.push({
      id: messageId,
      content,
      isUser,
      timestamp: new Date(),
      userId,
      avatarId
    });

    // Actualizar actividad
    buffer.lastActivity = new Date();

    // Verificar si debemos procesar el buffer
    this.checkBufferForProcessing(bufferKey);
  }

  /**
   * Marca el final de una conversación
   */
  static endConversation(userId: string, avatarId: string): void {
    const bufferKey = this.getBufferKey(userId, avatarId);
    const buffer = this.buffers.get(bufferKey);
    
    if (buffer) {
      buffer.isActive = false;
      this.processBuffer(bufferKey);
    }
  }

  /**
   * Verifica si un buffer debe ser procesado
   */
  private static checkBufferForProcessing(bufferKey: string): void {
    const buffer = this.buffers.get(bufferKey);
    if (!buffer) return;

    const now = new Date();
    const timeSinceLastActivity = now.getTime() - buffer.lastActivity.getTime();
    const hasEnoughMessages = buffer.messages.length >= this.MIN_MESSAGES_FOR_ANALYSIS;
    const hasTimedOut = timeSinceLastActivity > this.BUFFER_TIMEOUT;
    const isFull = buffer.messages.length >= this.MAX_BUFFER_SIZE;

    if ((hasEnoughMessages && (hasTimedOut || !buffer.isActive)) || isFull) {
      this.processBuffer(bufferKey);
    }
  }

  /**
   * Procesa un buffer y envía los mensajes para análisis
   */
  private static async processBuffer(bufferKey: string): Promise<void> {
    const buffer = this.buffers.get(bufferKey);
    if (!buffer || buffer.messages.length === 0) return;

    try {
      console.log(`[ConversationBuffer] Procesando buffer para ${buffer.userId}/${buffer.avatarId} con ${buffer.messages.length} mensajes`);

      // Convertir mensajes a formato de conversación
      const conversationText = buffer.messages
        .map(msg => `${msg.isUser ? 'Usuario' : 'Avatar'}: ${msg.content}`)
        .join('\n');

      // Enviar para análisis con Venice + Voyage
      await BatchMemoryAnalysisService.analyzeConversation(
        buffer.userId,
        buffer.avatarId
      );

      // Limpiar buffer procesado
      this.buffers.delete(bufferKey);
      
      console.log(`[ConversationBuffer] Buffer procesado y limpiado para ${buffer.userId}/${buffer.avatarId}`);
    } catch (error) {
      console.error(`[ConversationBuffer] Error procesando buffer:`, error);
      // No eliminar el buffer en caso de error para reintentar
    }
  }

  /**
   * Obtiene la clave única del buffer
   */
  private static getBufferKey(userId: string, avatarId: string): string {
    return `${userId}:${avatarId}`;
  }

  /**
   * Limpia buffers inactivos (para mantenimiento)
   */
  static cleanupInactiveBuffers(): void {
    const now = new Date();
    const inactiveBuffers: string[] = [];

    for (const [key, buffer] of this.buffers.entries()) {
      const timeSinceLastActivity = now.getTime() - buffer.lastActivity.getTime();
      if (timeSinceLastActivity > this.BUFFER_TIMEOUT * 2) { // 2x timeout
        inactiveBuffers.push(key);
      }
    }

    inactiveBuffers.forEach(key => {
      console.log(`[ConversationBuffer] Limpiando buffer inactivo: ${key}`);
      this.buffers.delete(key);
    });
  }

  /**
   * Obtiene estadísticas de los buffers
   */
  static getBufferStats(): {
    totalBuffers: number;
    totalMessages: number;
    activeBuffers: number;
  } {
    let totalMessages = 0;
    let activeBuffers = 0;

    for (const buffer of this.buffers.values()) {
      totalMessages += buffer.messages.length;
      if (buffer.isActive) activeBuffers++;
    }

    return {
      totalBuffers: this.buffers.size,
      totalMessages,
      activeBuffers
    };
  }
}

export default ConversationBufferService; 