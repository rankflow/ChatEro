import { PrismaClient } from '@prisma/client';
import VoyageEmbeddingService from './voyageEmbeddingService.js';

const prisma = new PrismaClient();

interface MemorySearchResult {
  id: number;
  memoryType: string;
  memoryContent: string;
  confidence: number;
  similarity: number;
  lastUpdated: Date;
}

interface MemoryConsolidationResult {
  consolidatedMemories: number;
  newClusters: number;
  updatedClusters: number;
}

class MemoryService {
  private static readonly SIMILARITY_THRESHOLD = 0.85;
  private static readonly BATCH_SIZE = 10;
  private static readonly CACHE_TTL = 3600; // 1 hora

  /**
   * Busca memorias relevantes para un contexto dado
   */
  static async searchMemories(
    userId: string,
    avatarId: string,
    context: string,
    limit: number = 5
  ): Promise<MemorySearchResult[]> {
    try {
      console.log(`[MemoryService] Buscando memorias para usuario ${userId}, avatar ${avatarId}`);
      
      // Generar embedding del contexto de búsqueda
      const contextEmbedding = await VoyageEmbeddingService.generateEmbedding(context);
      
      // Buscar memorias existentes del usuario con este avatar
      const userMemories = await prisma.userMemory.findMany({
        where: {
          userId,
          avatarId
        },
        orderBy: {
          lastUpdated: 'desc'
        },
        take: 100 // Buscar en las últimas 100 memorias
      });

      if (userMemories.length === 0) {
        console.log('[MemoryService] No se encontraron memorias para este usuario/avatar');
        return [];
      }

      // Calcular similitud con cada memoria
      const memoriesWithSimilarity = await Promise.all(
        userMemories.map(async (memory) => {
          try {
            const memoryVector = JSON.parse(memory.memoryVector);
            const similarity = VoyageEmbeddingService.calculateCosineSimilarity(
              contextEmbedding,
              memoryVector
            );
            
            return {
              ...memory,
              similarity
            };
          } catch (error) {
            console.error('[MemoryService] Error calculando similitud:', error);
            return { ...memory, similarity: 0 };
          }
        })
      );

      // Filtrar por umbral de similitud y ordenar
      const relevantMemories = memoriesWithSimilarity
        .filter(memory => memory.similarity >= this.SIMILARITY_THRESHOLD)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      console.log(`[MemoryService] Encontradas ${relevantMemories.length} memorias relevantes`);
      
      return relevantMemories.map(memory => ({
        id: memory.id,
        memoryType: memory.memoryType,
        memoryContent: memory.memoryContent,
        confidence: memory.confidence,
        similarity: memory.similarity,
        lastUpdated: memory.lastUpdated
      }));

    } catch (error) {
      console.error('[MemoryService] Error buscando memorias:', error);
      throw error;
    }
  }

  /**
   * Guarda una nueva memoria para un usuario y avatar
   */
  static async saveMemory(
    userId: string,
    avatarId: string,
    memoryType: string,
    memoryContent: string,
    memoryKey?: string,
    confidence: number = 0.5,
    memoryOwner: 'user' | 'avatar' = 'user',
    categoryId?: number
  ): Promise<void> {
    try {
      console.log(`[MemoryService] Guardando memoria tipo: ${memoryType} (${memoryOwner})`);
      
      // Generar embedding del contenido de la memoria
      const memoryEmbedding = await VoyageEmbeddingService.generateEmbedding(memoryContent);
      
      // Buscar categoría por defecto si no se proporciona
      let finalCategoryId = categoryId;
      if (!finalCategoryId) {
        const defaultCategory = await prisma.memoryCategory.findFirst({
          where: { name: 'otros' }
        });
        finalCategoryId = defaultCategory?.id;
      }
      
      if (!finalCategoryId) {
        throw new Error('No se pudo encontrar una categoría para la memoria');
      }
      
      // Guardar en la base de datos
      await prisma.userMemory.create({
        data: {
          userId,
          avatarId,
          memoryType,
          memoryKey,
          memoryContent,
          memoryVector: JSON.stringify(memoryEmbedding),
          memoryOwner,
          confidence,
          lastUpdated: new Date(),
          categoryId: finalCategoryId
        }
      });

      console.log(`[MemoryService] Memoria guardada exitosamente (${memoryOwner})`);

    } catch (error) {
      console.error('[MemoryService] Error guardando memoria:', error);
      throw error;
    }
  }



  /**
   * Consolida memorias similares en clusters
   */
  static async consolidateMemories(userId: string): Promise<MemoryConsolidationResult> {
    try {
      console.log(`[MemoryService] Consolidando memorias para usuario ${userId}`);
      
      // Obtener todas las memorias del usuario
      const userMemories = await prisma.userMemory.findMany({
        where: { userId },
        orderBy: { lastUpdated: 'desc' }
      });

      if (userMemories.length === 0) {
        console.log('[MemoryService] No hay memorias para consolidar');
        return { consolidatedMemories: 0, newClusters: 0, updatedClusters: 0 };
      }

      let consolidatedCount = 0;
      let newClustersCount = 0;
      let updatedClustersCount = 0;

      // Agrupar por tipo de memoria
      const memoriesByType = this.groupBy(userMemories, 'memoryType');

      for (const [memoryType, memories] of Object.entries(memoriesByType)) {
        if (memories.length < 2) continue; // Necesitamos al menos 2 para consolidar

        // Buscar clusters existentes para este tipo
        const existingClusters = await prisma.memoryCluster.findMany({
          where: { userId, clusterType: memoryType }
        });

        // Procesar memorias en batches
        const batches = this.chunkArray(memories, this.BATCH_SIZE);

        for (const batch of batches) {
          const batchEmbeddings = batch.map(m => JSON.parse(m.memoryVector));
          
          // Calcular centroide del batch
          const centroid = this.calculateCentroid(batchEmbeddings);
          
          // Buscar cluster más cercano
          let closestCluster = null;
          let maxSimilarity = 0;

          for (const cluster of existingClusters) {
            const clusterCentroid = JSON.parse(cluster.centroidVector);
            const similarity = VoyageEmbeddingService.calculateCosineSimilarity(centroid, clusterCentroid);
            
            if (similarity > maxSimilarity && similarity >= this.SIMILARITY_THRESHOLD) {
              maxSimilarity = similarity;
              closestCluster = cluster;
            }
          }

          if (closestCluster) {
            // Actualizar cluster existente
            const updatedCentroid = this.updateCentroid(
              JSON.parse(closestCluster.centroidVector),
              centroid,
              closestCluster.memberCount,
              batch.length
            );

            await prisma.memoryCluster.update({
              where: { id: closestCluster.id },
              data: {
                centroidVector: JSON.stringify(updatedCentroid),
                memberCount: closestCluster.memberCount + batch.length,
                lastUpdated: new Date()
              }
            });

            updatedClustersCount++;
          } else {
            // Crear nuevo cluster
            await prisma.memoryCluster.create({
              data: {
                userId,
                clusterType: memoryType,
                clusterName: `${memoryType}_cluster_${Date.now()}`,
                centroidVector: JSON.stringify(centroid),
                memberCount: batch.length,
                lastUpdated: new Date()
              }
            });

            newClustersCount++;
          }

          consolidatedCount += batch.length;
        }
      }

      console.log(`[MemoryService] Consolidación completada: ${consolidatedCount} memorias, ${newClustersCount} nuevos clusters, ${updatedClustersCount} clusters actualizados`);

      return {
        consolidatedMemories: consolidatedCount,
        newClusters: newClustersCount,
        updatedClusters: updatedClustersCount
      };

    } catch (error) {
      console.error('[MemoryService] Error consolidando memorias:', error);
      throw error;
    }
  }

  /**
   * Genera resumen de sesión
   */
  static async generateSessionSummary(
    userId: string,
    avatarId: string,
    sessionId: string,
    sessionMessages: string[]
  ): Promise<void> {
    try {
      console.log(`[MemoryService] Generando resumen de sesión ${sessionId}`);
      
      if (sessionMessages.length === 0) {
        console.log('[MemoryService] No hay mensajes para resumir');
        return;
      }

      // Crear texto para resumen
      const sessionText = sessionMessages.join('\n');
      
      // Generar embedding del resumen
      const summaryEmbedding = await VoyageEmbeddingService.generateEmbedding(sessionText);
      
      // Extraer temas clave (simulación - en producción usaría AI)
      const keyTopics = this.extractKeyTopics(sessionMessages);
      
      // Guardar resumen
      await prisma.sessionSummary.create({
        data: {
          userId,
          avatarId,
          sessionId,
          summary: sessionText.substring(0, 1000), // Limitar longitud
          summaryVector: JSON.stringify(summaryEmbedding),
          keyTopics: JSON.stringify(keyTopics),
          emotionalTone: this.analyzeEmotionalTone(sessionText)
        }
      });

      console.log('[MemoryService] Resumen de sesión generado');

    } catch (error) {
      console.error('[MemoryService] Error generando resumen de sesión:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de memoria para un usuario
   */
  static async getMemoryStats(userId: string): Promise<{
    totalMemories: number;
    totalClusters: number;
    totalSessions: number;
    memoryTypes: Record<string, number>;
  }> {
    try {
      const [memories, clusters, sessions, memoryTypes] = await Promise.all([
        prisma.userMemory.count({ where: { userId } }),
        prisma.memoryCluster.count({ where: { userId } }),
        prisma.sessionSummary.count({ where: { userId } }),
        prisma.userMemory.groupBy({
          by: ['memoryType'],
          where: { userId },
          _count: { memoryType: true }
        })
      ]);

      const memoryTypesCount = memoryTypes.reduce((acc, item) => {
        acc[item.memoryType] = item._count.memoryType;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalMemories: memories,
        totalClusters: clusters,
        totalSessions: sessions,
        memoryTypes: memoryTypesCount
      };

    } catch (error) {
      console.error('[MemoryService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Métodos auxiliares privados

  private static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private static calculateCentroid(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];
    
    const dimensions = vectors[0].length;
    const centroid = new Array(dimensions).fill(0);
    
    for (const vector of vectors) {
      for (let i = 0; i < dimensions; i++) {
        centroid[i] += vector[i];
      }
    }
    
    for (let i = 0; i < dimensions; i++) {
      centroid[i] /= vectors.length;
    }
    
    return centroid;
  }

  private static updateCentroid(
    oldCentroid: number[],
    newCentroid: number[],
    oldCount: number,
    newCount: number
  ): number[] {
    const totalCount = oldCount + newCount;
    const updatedCentroid = new Array(oldCentroid.length).fill(0);
    
    for (let i = 0; i < oldCentroid.length; i++) {
      updatedCentroid[i] = (oldCentroid[i] * oldCount + newCentroid[i] * newCount) / totalCount;
    }
    
    return updatedCentroid;
  }

  private static extractKeyTopics(messages: string[]): string[] {
    // Simulación de extracción de temas clave
    // En producción, usaría AI para analizar el contenido
    const commonTopics = ['viajes', 'música', 'comida', 'trabajo', 'familia', 'hobbies'];
    const foundTopics: string[] = [];
    
    const text = messages.join(' ').toLowerCase();
    
    for (const topic of commonTopics) {
      if (text.includes(topic)) {
        foundTopics.push(topic);
      }
    }
    
    return foundTopics.slice(0, 5); // Máximo 5 temas
  }

  private static analyzeEmotionalTone(text: string): string {
    // Simulación de análisis de tono emocional
    const positiveWords = ['feliz', 'contento', 'alegre', 'excitado', 'amor'];
    const negativeWords = ['triste', 'enojado', 'frustrado', 'deprimido', 'miedo'];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of positiveWords) {
      if (lowerText.includes(word)) positiveCount++;
    }
    
    for (const word of negativeWords) {
      if (lowerText.includes(word)) negativeCount++;
    }
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

export default MemoryService; 