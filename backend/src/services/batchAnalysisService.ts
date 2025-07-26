import { DatabaseService } from './database';
import { VeniceAIService } from './veniceAIService';
import VoyageEmbeddingService from './voyageEmbeddingService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BatchTriggers {
  minInactivityMinutes: number;    // 4 horas de inactividad (secundario)
  minMessages: number;             // 80 turnos (PRINCIPAL)
  forceBatchAtMessages: number;    // Forzar cada 80 turnos
  maxTimeSinceLastBatch: number;   // 8 horas máximo (seguridad)
}

export class BatchAnalysisService {
  private static readonly BATCH_TRIGGERS: BatchTriggers = {
    minInactivityMinutes: 240,    // 4 horas
    minMessages: 5,               // 5 turnos (PRINCIPAL) - PARA PRUEBAS
    forceBatchAtMessages: 5,      // Forzar cada 5 turnos - PARA PRUEBAS
    maxTimeSinceLastBatch: 480    // 8 horas máximo
  };

  /**
   * Verifica si se debe disparar el análisis batch
   */
  static async shouldTriggerBatch(userId: string, avatarId: string): Promise<boolean> {
    try {
      // Obtener estadísticas de la conversación
      const stats = await this.getConversationStats(userId, avatarId);
      
      // Verificar condiciones de disparo
      const shouldTrigger = 
        this.checkMessageCount(stats.messageCount) ||
        this.checkInactivityTime(stats.lastMessageTime) ||
        this.checkTimeSinceLastBatch(stats.lastBatchTime);

      if (shouldTrigger) {
        console.log(`[BatchAnalysis] Disparando batch para usuario ${userId}, avatar ${avatarId}`);
        console.log(`[BatchAnalysis] Stats: ${JSON.stringify(stats)}`);
      }

      return shouldTrigger;
    } catch (error) {
      console.error('[BatchAnalysis] Error verificando batch:', error);
      return false;
    }
  }

  /**
   * Ejecuta el análisis batch con sistema de enriquecimiento
   */
  static async executeBatchAnalysis(userId: string, avatarId: string): Promise<void> {
    try {
      console.log(`[BatchAnalysis] Ejecutando análisis batch para usuario ${userId}, avatar ${avatarId}`);
      
      // Obtener mensajes no procesados
      const unprocessedMessages = await DatabaseService.getUnprocessedMessages(userId, avatarId);
      
      if (unprocessedMessages.length === 0) {
        console.log('[BatchAnalysis] No hay mensajes para procesar');
        return;
      }

      // Procesar mensajes con Venice AI y extraer memorias
      const conversationText = this.messagesToConversationText(unprocessedMessages);
      const extractedMemories = await VeniceAIService.convertAnalysisToMemories(
        await VeniceAIService.analyzeConversation(conversationText)
      );

      // Guardar memorias con sistema de enriquecimiento
      let memoriesSaved = 0;

      // Guardar memorias del usuario
      for (const memory of extractedMemories.userMemories) {
        await this.saveOrEnrichMemory(userId, avatarId, memory, 'user');
        memoriesSaved++;
      }

      // Guardar memorias del avatar
      for (const memory of extractedMemories.avatarMemories) {
        await this.saveOrEnrichMemory(userId, avatarId, memory, 'avatar');
        memoriesSaved++;
      }

      // Guardar memorias compartidas
      for (const memory of extractedMemories.sharedMemories) {
        await this.saveOrEnrichMemory(userId, avatarId, memory, 'shared');
        memoriesSaved++;
      }
      
      // Marcar mensajes como procesados
      await DatabaseService.markMessagesAsProcessed(unprocessedMessages.map(m => m.id));
      
      // Actualizar timestamp del último batch
      await DatabaseService.updateLastBatchTime(userId, avatarId);
      
      console.log(`[BatchAnalysis] Análisis batch completado. ${unprocessedMessages.length} mensajes procesados, ${memoriesSaved} memorias guardadas`);
    } catch (error) {
      console.error('[BatchAnalysis] Error ejecutando análisis batch:', error);
      throw error;
    }
  }

  /**
   * Convierte mensajes a texto de conversación
   */
  private static messagesToConversationText(messages: any[]): string {
    return messages.map(message => {
      const speaker = message.isUser ? 'Usuario' : 'Avatar';
      return `${speaker}: ${message.content}`;
    }).join('\n\n');
  }

  /**
   * Guarda o enriquece memoria con sistema de embeddings
   */
  private static async saveOrEnrichMemory(
    userId: string,
    avatarId: string,
    memory: { category: string; content: string; tags?: string[] },
    owner: 'user' | 'avatar' | 'shared'
  ): Promise<void> {
    try {
      // Buscar categoría por nombre
      const category = await this.findCategoryByName(memory.category);
      if (!category) {
        console.warn(`[BatchAnalysis] Categoría no encontrada: ${memory.category}`);
        return;
      }

      // Buscar memoria similar para enriquecimiento
      const similarMemory = await this.findSimilarMemory(userId, avatarId, category.id, memory.content);
      
      if (similarMemory) {
        // Enriquecer memoria existente
        const enrichedContent = `${similarMemory.memoryContent} y ${memory.content}`;
        const enrichedEmbedding = await VoyageEmbeddingService.generateEmbedding(enrichedContent);
        
        await prisma.userMemory.update({
          where: { id: similarMemory.id },
          data: {
            memoryContent: enrichedContent,
            memoryVector: JSON.stringify(enrichedEmbedding),
            lastUpdated: new Date(),
            tags: memory.tags ? JSON.stringify(memory.tags) : similarMemory.tags
          }
        });

        console.log(`[BatchAnalysis] Memoria enriquecida: ${memory.content}`);
      } else {
        // Crear nueva memoria
        const embedding = await VoyageEmbeddingService.generateEmbedding(memory.content);
        
        await prisma.userMemory.create({
          data: {
            userId,
            avatarId,
            categoryId: category.id,
            memoryContent: memory.content,
            memoryVector: JSON.stringify(embedding),
            memoryOwner: owner === 'shared' ? 'user' : owner,
            source: 'batch_analysis',
            sessionId: `batch_analysis_${Date.now()}`,
            turnCount: 1,
            confidence: 0.8,
            tags: memory.tags ? JSON.stringify(memory.tags) : null,
            isActive: true
          }
        });

        console.log(`[BatchAnalysis] Nueva memoria creada: ${memory.content}`);
      }

    } catch (error) {
      console.error('[BatchAnalysis] Error guardando memoria:', error);
    }
  }

  /**
   * Busca categoría por nombre (soporta jerarquía)
   */
  private static async findCategoryByName(categoryName: string) {
    // Buscar por nombre exacto
    let category = await prisma.memoryCategory.findFirst({
      where: { name: categoryName }
    });

    if (!category) {
      // Buscar en jerarquía (ej: "gustos.musica")
      const parts = categoryName.split('.');
      if (parts.length === 2) {
        const parentName = parts[0];
        const childName = parts[1];

        const parent = await prisma.memoryCategory.findFirst({
          where: { name: parentName }
        });

        if (parent) {
          category = await prisma.memoryCategory.findFirst({
            where: {
              name: childName,
              parentId: parent.id
            }
          });
        }
      }
    }

    return category;
  }

  /**
   * Busca memoria similar para enriquecimiento
   */
  private static async findSimilarMemory(
    userId: string,
    avatarId: string,
    categoryId: number,
    content: string
  ) {
    try {
      // Obtener memorias existentes de la misma categoría
      const existingMemories = await prisma.userMemory.findMany({
        where: {
          userId,
          avatarId,
          categoryId,
          isActive: true
        },
        select: {
          id: true,
          memoryContent: true,
          memoryVector: true,
          tags: true
        }
      });

      if (existingMemories.length === 0) return null;

      // Generar embedding del contenido actual
      const currentEmbedding = await VoyageEmbeddingService.generateEmbedding(content);

      // Calcular similitud con cada memoria existente
      let bestMatch = null;
      let bestSimilarity = 0;
      const similarityThreshold = 0.8; // Umbral de similitud

      for (const memory of existingMemories) {
        if (!memory.memoryVector) continue;

        const memoryEmbedding = JSON.parse(memory.memoryVector);
        const similarity = this.calculateCosineSimilarity(currentEmbedding, memoryEmbedding);

        if (similarity > bestSimilarity && similarity >= similarityThreshold) {
          bestSimilarity = similarity;
          bestMatch = memory;
        }
      }

      return bestMatch;
    } catch (error) {
      console.error('[BatchAnalysis] Error buscando memoria similar:', error);
      return null;
    }
  }

  /**
   * Calcula similitud coseno entre dos vectores
   */
  private static calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Obtiene estadísticas de la conversación
   */
  private static async getConversationStats(userId: string, avatarId: string) {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - this.BATCH_TRIGGERS.minInactivityMinutes * 60 * 1000);
    const eightHoursAgo = new Date(now.getTime() - this.BATCH_TRIGGERS.maxTimeSinceLastBatch * 60 * 1000);

    // Obtener mensajes de las últimas 4 horas
    const { messages } = await DatabaseService.getMessageHistoryByAvatar(
      userId, avatarId, 4, 1000, 0
    );

    // Obtener último batch
    const lastBatch = await DatabaseService.getLastBatchTime(userId, avatarId);

    return {
      messageCount: messages.length,
      lastMessageTime: messages.length > 0 ? messages[messages.length - 1].createdAt : null,
      lastBatchTime: lastBatch,
      hasRecentActivity: messages.some(m => m.createdAt > fourHoursAgo)
    };
  }

  /**
   * Verifica condición de cantidad de mensajes
   */
  private static checkMessageCount(messageCount: number): boolean {
    return messageCount >= this.BATCH_TRIGGERS.minMessages;
  }

  /**
   * Verifica condición de tiempo de inactividad
   */
  private static checkInactivityTime(lastMessageTime: Date | null): boolean {
    if (!lastMessageTime) return false;
    
    const now = new Date();
    const timeSinceLastMessage = now.getTime() - lastMessageTime.getTime();
    const inactivityThreshold = this.BATCH_TRIGGERS.minInactivityMinutes * 60 * 1000;
    
    return timeSinceLastMessage >= inactivityThreshold;
  }

  /**
   * Verifica condición de tiempo desde último batch
   */
  private static checkTimeSinceLastBatch(lastBatchTime: Date | null): boolean {
    if (!lastBatchTime) return true; // Si nunca se ha hecho batch, hacerlo
    
    const now = new Date();
    const timeSinceLastBatch = now.getTime() - lastBatchTime.getTime();
    const maxTimeThreshold = this.BATCH_TRIGGERS.maxTimeSinceLastBatch * 60 * 1000;
    
    return timeSinceLastBatch >= maxTimeThreshold;
  }
} 