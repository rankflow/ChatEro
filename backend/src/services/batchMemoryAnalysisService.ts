import { PrismaClient, Message } from '@prisma/client';
import VoyageEmbeddingService from './voyageEmbeddingService.js';
import MemoryService from './memoryService.js';
import VeniceAIService from './veniceAIService.js';
import { MetricsService } from './metricsService.js';

const prisma = new PrismaClient();

interface ExtractedMemories {
  userMemories: Array<{
    category: string;
    content: string;
    tags?: string[];
  }>;
  avatarMemories: Array<{
    category: string;
    content: string;
    tags?: string[];
  }>;
  sharedMemories: Array<{
    category: string;
    content: string;
    tags?: string[];
  }>;
}

interface BatchProcessingResult {
  batchIndex: number;
  totalBatches: number;
  memoriesExtracted: number;
  success: boolean;
  error?: string;
  processingTime: number;
  apiCalls: number;
}

interface SimilarityThresholds {
  gustos: number;
  cualidades: number;
  anecdotas: number;
  sexualidad: number;
  relaciones: number;
  historia_personal: number;
  emociones: number;
  otros: number;
}

interface BatchAnalysisConfig {
  maxTurnsPerBatch: number;
  tokensPerTurnEstimate: number;
  voyageTokenLimit: number;
  safetyMargin: number;
  similarityThresholds: SimilarityThresholds;
  maxRetries: number;
  retryDelay: number;
  batchDelay: number;
}

interface PerformanceMetrics {
  totalAnalysisTime: number;
  totalBatches: number;
  successfulBatches: number;
  totalMemoriesExtracted: number;
  totalApiCalls: number;
  averageBatchTime: number;
  errors: string[];
  timestamp: Date;
}

// Añadir tipo extendido para memorias con embedding
interface MemoryWithEmbedding extends Omit<{ category: string; content: string; tags?: string[] }, 'embedding'> {
  embedding: number[];
}

export class BatchMemoryAnalysisService {
  private static readonly DEFAULT_CONFIG: BatchAnalysisConfig = {
    maxTurnsPerBatch: 80,
    tokensPerTurnEstimate: 300,
    voyageTokenLimit: 32768,
    safetyMargin: 0.8, // 80% del límite para seguridad
    similarityThresholds: {
      gustos: 0.80,        // Más flexible para gustos
      cualidades: 0.90,    // Más estricto para cualidades
      anecdotas: 0.75,     // Más flexible para anécdotas
      sexualidad: 0.85,    // Medio para sexualidad
      relaciones: 0.85,    // Medio para relaciones
      historia_personal: 0.80, // Flexible para historia personal
      emociones: 0.85,     // Medio para emociones
      otros: 0.80          // Flexible para otros
    },
    maxRetries: 3,
    retryDelay: 2000, // 2 segundos
    batchDelay: 1000  // 1 segundo entre batches
  };

  private static performanceMetrics: PerformanceMetrics[] = [];

  /**
   * Analiza una conversación completa usando análisis batch optimizado
   */
  static async analyzeConversation(userId: string, avatarId: string): Promise<void> {
    const startTime = Date.now();
    const analysisId = `analysis_${userId}_${avatarId}_${Date.now()}`;
    
    const metrics: PerformanceMetrics = {
      totalAnalysisTime: 0,
      totalBatches: 0,
      successfulBatches: 0,
      totalMemoriesExtracted: 0,
      totalApiCalls: 0,
      averageBatchTime: 0,
      errors: [],
      timestamp: new Date()
    };

    try {
      console.log(`[${analysisId}] 🚀 INICIANDO ANÁLISIS BATCH`);
      console.log(`[${analysisId}] 👤 Usuario: ${userId}`);
      console.log(`[${analysisId}] 🤖 Avatar: ${avatarId}`);
      console.log(`[${analysisId}] ⏰ Timestamp: ${new Date().toISOString()}`);

      // 1. Obtener todos los mensajes de la conversación
      console.log(`[${analysisId}] 📥 Recuperando mensajes de la base de datos...`);
      const messages = await this.getConversationMessages(userId, avatarId);
      
      if (messages.length === 0) {
        console.log(`[${analysisId}] ⚠️ No hay mensajes para analizar - Finalizando`);
        return;
      }

      console.log(`[${analysisId}] ✅ Encontrados ${messages.length} mensajes (${messages.length * 2} turnos totales)`);
      console.log(`[${analysisId}] 📊 Rango temporal: ${messages[0]?.createdAt?.toISOString()} → ${messages[messages.length - 1]?.createdAt?.toISOString()}`);

      // 2. Fraccionar en batches
      console.log(`[${analysisId}] 🔄 Fraccionando conversación en batches...`);
      const batches = this.createBatches(messages);
      metrics.totalBatches = batches.length;
      console.log(`[${analysisId}] ✅ Conversación fraccionada en ${batches.length} batches`);
      
      // Log detallado de batches
      batches.forEach((batch, index) => {
        console.log(`[${analysisId}] 📦 Batch ${index + 1}: ${batch.length} mensajes (~${Math.round(batch.reduce((sum, msg) => sum + msg.content.length, 0) / 4)} tokens)`);
      });

      // 3. Procesar cola de batches con gestión de errores robusta
      console.log(`[${analysisId}] 🔄 Iniciando procesamiento de ${batches.length} batches...`);
      const results = await this.processBatchQueue(userId, avatarId, batches);
      
      // 4. Calcular métricas
      metrics.successfulBatches = results.filter(r => r.success).length;
      metrics.totalMemoriesExtracted = results.reduce((sum, r) => sum + r.memoriesExtracted, 0);
      metrics.totalApiCalls = results.reduce((sum, r) => sum + r.apiCalls, 0);
      metrics.averageBatchTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
      metrics.errors = results.filter(r => !r.success).map(r => r.error || 'Error desconocido');

      console.log(`[${analysisId}] 📊 MÉTRICAS INTERMEDIAS:`);
      console.log(`[${analysisId}]   ✅ Batches exitosos: ${metrics.successfulBatches}/${metrics.totalBatches}`);
      console.log(`[${analysisId}]   🧠 Memorias extraídas: ${metrics.totalMemoriesExtracted}`);
      console.log(`[${analysisId}]   📡 Llamadas API: ${metrics.totalApiCalls}`);
      console.log(`[${analysisId}]   ⏱️ Tiempo promedio por batch: ${Math.round(metrics.averageBatchTime)}ms`);

      // 5. Verificar completitud
      console.log(`[${analysisId}] 🔍 Verificando completitud del análisis...`);
      const allProcessed = await this.verifyAllBatchesProcessed(userId, avatarId);
      
      if (allProcessed) {
        console.log(`[${analysisId}] ✅ Análisis batch completado exitosamente`);
      } else {
        console.error(`[${analysisId}] ❌ Error: No todos los batches fueron procesados`);
        metrics.errors.push('No todos los batches fueron procesados');
      }

      // 6. Registrar métricas
      metrics.totalAnalysisTime = Date.now() - startTime;
      this.recordMetrics(metrics);

      // 7. Registrar en MetricsService
      MetricsService.recordConversationAnalysis(
        userId,
        avatarId,
        messages.length,
        metrics.totalMemoriesExtracted,
        metrics.totalAnalysisTime,
        metrics.successfulBatches === metrics.totalBatches,
        metrics.errors
      );

      // 8. Log de resumen
      this.logAnalysisSummary(metrics);

      console.log(`[${analysisId}] 🎉 ANÁLISIS BATCH FINALIZADO`);
      console.log(`[${analysisId}] ⏱️ Tiempo total: ${metrics.totalAnalysisTime}ms`);
      console.log(`[${analysisId}] 🧠 Memorias totales: ${metrics.totalMemoriesExtracted}`);
      console.log(`[${analysisId}] 📡 APIs totales: ${metrics.totalApiCalls}`);

    } catch (error) {
      console.error(`[${analysisId}] 💥 ERROR CRÍTICO EN ANÁLISIS:`, error);
      metrics.errors.push(error instanceof Error ? error.message : 'Error crítico desconocido');
      metrics.totalAnalysisTime = Date.now() - startTime;
      this.recordMetrics(metrics);
      throw error;
    }
  }

  /**
   * Obtiene todos los mensajes de una conversación
   */
  private static async getConversationMessages(userId: string, avatarId: string): Promise<Message[]> {
    return await prisma.message.findMany({
      where: {
        userId,
        avatarId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  /**
   * Crea batches de mensajes basado en el límite de tokens
   */
  private static createBatches(messages: Message[]): Message[][] {
    const batches: Message[][] = [];
    let currentBatch: Message[] = [];
    let currentTokenCount = 0;

    for (const message of messages) {
      const estimatedTokens = message.content.length / 4; // Estimación aproximada
      const batchTokens = currentTokenCount + estimatedTokens;

      // Si excede el límite, crear nuevo batch
      if (batchTokens > this.DEFAULT_CONFIG.voyageTokenLimit * this.DEFAULT_CONFIG.safetyMargin || 
          currentBatch.length >= this.DEFAULT_CONFIG.maxTurnsPerBatch) {
        if (currentBatch.length > 0) {
          batches.push([...currentBatch]);
          currentBatch = [];
          currentTokenCount = 0;
        }
      }

      currentBatch.push(message);
      currentTokenCount += estimatedTokens;
    }

    // Añadir el último batch si tiene contenido
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /**
   * Procesa la cola de batches secuencialmente con gestión de errores robusta
   */
  private static async processBatchQueue(userId: string, avatarId: string, batches: Message[][]): Promise<BatchProcessingResult[]> {
    console.log(`[BatchMemoryAnalysisService] Procesando cola de ${batches.length} batches con gestión de errores robusta`);

    const results: BatchProcessingResult[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchIndex = i + 1;
      const totalBatches = batches.length;

      console.log(`[BatchMemoryAnalysisService] Procesando batch ${batchIndex}/${totalBatches} (${batch.length} mensajes)`);

      try {
        const result = await this.processBatchWithRetry(userId, avatarId, batch, batchIndex, totalBatches);
        results.push(result);

        if (result.success) {
          console.log(`[BatchMemoryAnalysisService] Batch ${batchIndex}/${totalBatches} procesado exitosamente (${result.memoriesExtracted} memorias extraídas, ${result.processingTime}ms)`);
        } else {
          console.error(`[BatchMemoryAnalysisService] Error en batch ${batchIndex}/${totalBatches}: ${result.error}`);
        }

        // Pausa configurable entre batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, this.DEFAULT_CONFIG.batchDelay));
        }

      } catch (error) {
        console.error(`[BatchMemoryAnalysisService] Error crítico en batch ${batchIndex}/${totalBatches}:`, error);
        results.push({
          batchIndex,
          totalBatches,
          memoriesExtracted: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          processingTime: 0,
          apiCalls: 0
        });
      }
    }

    return results;
  }

  /**
   * Procesa un batch con reintentos automáticos
   */
  private static async processBatchWithRetry(
    userId: string, 
    avatarId: string, 
    messages: Message[], 
    batchIndex: number, 
    totalBatches: number
  ): Promise<BatchProcessingResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.DEFAULT_CONFIG.maxRetries; attempt++) {
      try {
        const result = await this.processBatch(userId, avatarId, messages, batchIndex, totalBatches);
        
        if (result.success) {
          return result;
        } else {
          lastError = new Error(result.error || 'Error desconocido en batch');
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        console.warn(`[BatchMemoryAnalysisService] Intento ${attempt}/${this.DEFAULT_CONFIG.maxRetries} falló:`, lastError.message);
      }

      // Esperar antes del siguiente intento (excepto en el último)
      if (attempt < this.DEFAULT_CONFIG.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.DEFAULT_CONFIG.retryDelay * attempt));
      }
    }

    // Todos los intentos fallaron
    return {
      batchIndex,
      totalBatches,
      memoriesExtracted: 0,
      success: false,
      error: lastError?.message || 'Error después de todos los reintentos',
      processingTime: 0,
      apiCalls: 0
    };
  }

  /**
   * Procesa un batch individual de mensajes con métricas
   */
  private static async processBatch(
    userId: string, 
    avatarId: string, 
    messages: Message[], 
    batchIndex: number, 
    totalBatches: number
  ): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    let apiCalls = 0;

    try {
      // 1. Convertir mensajes a texto de conversación
      const conversationText = this.messagesToConversationText(messages);

      // 2. Extraer memorias usando Venice AI con fallback
      const extractedMemories = await this.extractMemoriesFromBatchWithFallback(conversationText);
      apiCalls++; // Contar llamada a Voyage AI

      // 3. Guardar memorias extraídas
      let memoriesSaved = 0;

      // Guardar memorias del usuario
      for (const memory of extractedMemories.userMemories) {
        await this.saveOrEnrichMemory(userId, avatarId, memory, 'user', batchIndex, totalBatches);
        memoriesSaved++;
        apiCalls++; // Contar llamada para embedding
      }

      // Guardar memorias del avatar
      for (const memory of extractedMemories.avatarMemories) {
        await this.saveOrEnrichMemory(userId, avatarId, memory, 'avatar', batchIndex, totalBatches);
        memoriesSaved++;
        apiCalls++; // Contar llamada para embedding
      }

      // Guardar memorias compartidas
      for (const memory of extractedMemories.sharedMemories) {
        await this.saveOrEnrichMemory(userId, avatarId, memory, 'shared', batchIndex, totalBatches);
        memoriesSaved++;
        apiCalls++; // Contar llamada para embedding
      }

      return {
        batchIndex,
        totalBatches,
        memoriesExtracted: memoriesSaved,
        success: true,
        processingTime: Date.now() - startTime,
        apiCalls
      };

    } catch (error) {
      console.error(`[BatchMemoryAnalysisService] Error procesando batch ${batchIndex}/${totalBatches}:`, error);
      return {
        batchIndex,
        totalBatches,
        memoriesExtracted: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        processingTime: Date.now() - startTime,
        apiCalls
      };
    }
  }

  /**
   * Convierte mensajes a texto de conversación
   */
  private static messagesToConversationText(messages: Message[]): string {
    return messages.map(message => {
      const speaker = message.isUser ? 'Usuario' : 'Avatar';
      return `${speaker}: ${message.content}`;
    }).join('\n\n');
  }

  /**
   * Extrae memorias de un batch usando Venice AI y luego genera embeddings con Voyage
   */
  private static async extractMemoriesFromBatch(conversationText: string): Promise<ExtractedMemories> {
    try {
      // 1. Analizar conversación con Venice para extraer memorias categorizadas
      const veniceAnalysis = await VeniceAIService.analyzeConversation(conversationText);
      // 2. Convertir análisis de Venice a formato de memorias
      const extracted = VeniceAIService.convertAnalysisToMemories(veniceAnalysis);
      // 3. Para cada memoria, generar embedding con Voyage
      const addEmbeddings = async (memories: Array<{category: string, content: string, tags?: string[]}>): Promise<MemoryWithEmbedding[]> => {
        const result: MemoryWithEmbedding[] = [];
        for (const mem of memories) {
          const embedding = await VoyageEmbeddingService.generateEmbedding(mem.content);
          result.push({ ...mem, embedding });
        }
        return result;
      };
      extracted.userMemories = await addEmbeddings(extracted.userMemories);
      extracted.avatarMemories = await addEmbeddings(extracted.avatarMemories);
      extracted.sharedMemories = await addEmbeddings(extracted.sharedMemories);
      return extracted;
    } catch (error) {
      console.error('[BatchMemoryAnalysisService] Error extrayendo memorias con Venice+Voyage:', error);
      return {
        userMemories: [],
        avatarMemories: [],
        sharedMemories: []
      };
    }
  }

  /**
   * Extrae memorias de un batch usando Voyage AI con fallback
   */
  private static async extractMemoriesFromBatchWithFallback(conversationText: string): Promise<ExtractedMemories> {
    try {
      return await this.extractMemoriesFromBatch(conversationText);
    } catch (error) {
      console.warn('[BatchMemoryAnalysisService] Fallback: Voyage AI no pudo extraer memorias. Intentando con Voyage AI (fallback) ...');
      try {
        const prompt = `
Analiza esta conversación y extrae memorias importantes:

CONVERSACIÓN:
${conversationText}

EXTRACTA:
- user_memories: Preferencias, gustos, información personal del usuario
- avatar_memories: Preferencias, gustos, información personal del avatar
- shared_memories: Información compartida entre ambos

CATEGORÍAS DISPONIBLES:
- gustos: musica, comida, deportes, cine_series, literatura, videojuegos, moda, actividades, otros_gustos
- sexualidad: zona_placer, estilo_favorito, lenguaje_erotico, fantasias, fetiches, rituales_sexuales, tabues
- relaciones: nicknames, dinámicas_afectivas, roles_relacionales
- historia_personal: traumas, miedos, afiliaciones, valores, historia_familiar, logros_personales, líneas_de_tiempo
- emociones, cualidades_personales, anecdotas, otros

FORMATO JSON EXACTO:
{
  "user_memories": [
    {
      "category": "gustos.musica",
      "content": "le gusta la música rock y jazz",
      "tags": ["rock", "jazz", "música"]
    }
  ],
  "avatar_memories": [
    {
      "category": "gustos.musica", 
      "content": "toca guitarra y canta en italiano",
      "tags": ["guitarra", "canto", "italiano"]
    }
  ],
  "shared_memories": [
    {
      "category": "relaciones.nicknames",
      "content": "se llaman cariñosamente 'mi amor'",
      "tags": ["cariño", "apodo"]
    }
  ]
}

IMPORTANTE:
- Solo extrae información relevante y específica
- Usa categorías exactas de la lista
- Incluye tags relevantes cuando sea apropiado
- Si no hay información de un tipo, devuelve array vacío
`;
        const response = await VoyageEmbeddingService.analyzeWithVoyage(prompt);
        const parsedResponse = JSON.parse(response);
        console.log('[BatchMemoryAnalysisService] Análisis de Voyage AI (fallback) completado');
        return {
          userMemories: parsedResponse.user_memories || [],
          avatarMemories: parsedResponse.avatar_memories || [],
          sharedMemories: parsedResponse.shared_memories || []
        };
      } catch (fallbackError) {
        console.error('[BatchMemoryAnalysisService] Error extrayendo memorias (fallback):', fallbackError);
        return {
          userMemories: [],
          avatarMemories: [],
          sharedMemories: []
        };
      }
    }
  }

  /**
   * Guarda o enriquece una memoria
   */
  private static async saveOrEnrichMemory(
    userId: string,
    avatarId: string,
    memory: { category: string; content: string; tags?: string[]; embedding?: number[] },
    owner: 'user' | 'avatar' | 'shared',
    batchIndex: number,
    totalBatches: number
  ): Promise<void> {
    try {
      // Buscar categoría por nombre
      const category = await this.findCategoryByName(memory.category);
      if (!category) {
        console.warn(`[BatchMemoryAnalysisService] Categoría no encontrada: ${memory.category}`);
        return;
      }

      // Buscar memoria similar para enriquecimiento
      const similarMemory = await this.findSimilarMemory(userId, avatarId, category.id, memory.content);
      
      if (similarMemory) {
        // Enriquecer memoria existente
        const enrichedContent = `${similarMemory.memoryContent} y ${memory.content}`;
        const enrichedEmbedding = memory.embedding || await VoyageEmbeddingService.generateEmbedding(enrichedContent);
        
        await prisma.userMemory.update({
          where: { id: similarMemory.id },
          data: {
            memoryContent: enrichedContent,
            memoryVector: JSON.stringify(enrichedEmbedding),
            lastUpdated: new Date(),
            tags: memory.tags ? JSON.stringify(memory.tags) : similarMemory.tags
          }
        });

        console.log(`[BatchMemoryAnalysisService] Memoria enriquecida: ${memory.content}`);
      } else {
        // Crear nueva memoria
        const embedding = memory.embedding || await VoyageEmbeddingService.generateEmbedding(memory.content);
        
        await prisma.userMemory.create({
          data: {
            userId,
            avatarId,
            categoryId: category.id,
            memoryContent: memory.content,
            memoryVector: JSON.stringify(embedding),
            memoryOwner: owner === 'shared' ? 'user' : owner,
            source: 'batch_analysis',
            sessionId: `batch_${batchIndex}_${totalBatches}`,
            turnCount: batchIndex,
            confidence: 0.8,
            tags: memory.tags ? JSON.stringify(memory.tags) : null,
            isActive: true
          }
        });

        console.log(`[BatchMemoryAnalysisService] Nueva memoria creada: ${memory.content}`);
      }

    } catch (error) {
      console.error('[BatchMemoryAnalysisService] Error guardando memoria:', error);
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
   * Busca memoria similar para enriquecimiento con umbral adaptativo
   */
  private static async findSimilarMemory(
    userId: string,
    avatarId: string,
    categoryId: number,
    content: string
  ) {
    try {
      // Obtener la categoría para determinar el umbral
      const category = await prisma.memoryCategory.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        console.warn(`[BatchMemoryAnalysisService] Categoría no encontrada: ${categoryId}`);
        return null;
      }

      // Determinar umbral basado en la categoría
      const threshold = this.getSimilarityThresholdForCategory(category.name);
      console.log(`[BatchMemoryAnalysisService] Usando umbral ${threshold} para categoría ${category.name}`);

      const memories = await prisma.userMemory.findMany({
        where: {
          userId,
          avatarId,
          categoryId,
          isActive: true
        }
      });

      // Calcular similitud con embeddings existentes
      for (const memory of memories) {
        try {
          const existingEmbedding = JSON.parse(memory.memoryVector);
          const newEmbedding = await VoyageEmbeddingService.generateEmbedding(content);
          
          const similarity = this.calculateCosineSimilarity(existingEmbedding, newEmbedding);
          
          if (similarity >= threshold) {
            console.log(`[BatchMemoryAnalysisService] Memoria similar encontrada (similitud: ${similarity.toFixed(3)})`);
            return memory;
          }
        } catch (error) {
          console.warn('[BatchMemoryAnalysisService] Error calculando similitud:', error);
        }
      }

      return null;
    } catch (error) {
      console.error('[BatchMemoryAnalysisService] Error buscando memoria similar:', error);
      return null;
    }
  }

  /**
   * Obtiene el umbral de similitud para una categoría específica
   */
  private static getSimilarityThresholdForCategory(categoryName: string): number {
    // Buscar en categorías principales
    for (const [category, threshold] of Object.entries(this.DEFAULT_CONFIG.similarityThresholds)) {
      if (categoryName.toLowerCase().includes(category.toLowerCase())) {
        return threshold;
      }
    }

    // Buscar en subcategorías
    if (categoryName.includes('.')) {
      const mainCategory = categoryName.split('.')[0];
      for (const [category, threshold] of Object.entries(this.DEFAULT_CONFIG.similarityThresholds)) {
        if (mainCategory.toLowerCase().includes(category.toLowerCase())) {
          return threshold;
        }
      }
    }

    // Umbral por defecto
    return 0.85;
  }

  /**
   * Calcula similitud coseno entre dos vectores
   */
  private static calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Verifica que todos los batches fueron procesados
   */
  private static async verifyAllBatchesProcessed(userId: string, avatarId: string): Promise<boolean> {
    const batchMemories = await prisma.userMemory.findMany({
      where: {
        userId,
        avatarId,
        source: 'batch_analysis'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (batchMemories.length === 0) {
      console.warn('[BatchMemoryAnalysisService] No se encontraron memorias de batch analysis');
      return false;
    }

    console.log(`[BatchMemoryAnalysisService] Verificación: ${batchMemories.length} memorias de batch analysis encontradas`);
    return true;
  }

  /**
   * Registra las métricas de rendimiento
   */
  private static recordMetrics(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics);
    console.log(`[BatchMemoryAnalysisService] Métricas registradas:`, metrics);
  }

  /**
   * Log de resumen de análisis
   */
  private static logAnalysisSummary(metrics: PerformanceMetrics): void {
    console.log(`\n=== Resumen de Análisis Batch ===`);
    console.log(`Tiempo total de análisis: ${metrics.totalAnalysisTime / 1000} segundos`);
    console.log(`Número total de batches: ${metrics.totalBatches}`);
    console.log(`Batches exitosos: ${metrics.successfulBatches}/${metrics.totalBatches}`);
    console.log(`Memorias extraídas: ${metrics.totalMemoriesExtracted}`);
    console.log(`Llamadas a Voyage AI: ${metrics.totalApiCalls}`);
    console.log(`Tiempo promedio por batch: ${metrics.averageBatchTime}ms`);
    if (metrics.errors.length > 0) {
      console.warn(`Errores durante el análisis: ${metrics.errors.join(', ')}`);
    }
    console.log(`===================================\n`);
  }

  /**
   * Obtiene métricas de rendimiento
   */
  static getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * Obtiene resumen de métricas de rendimiento
   */
  static getPerformanceSummary(): {
    totalAnalyses: number;
    averageAnalysisTime: number;
    averageMemoriesPerAnalysis: number;
    averageApiCallsPerAnalysis: number;
    successRate: number;
    lastAnalysis: Date | null;
  } {
    if (this.performanceMetrics.length === 0) {
      return {
        totalAnalyses: 0,
        averageAnalysisTime: 0,
        averageMemoriesPerAnalysis: 0,
        averageApiCallsPerAnalysis: 0,
        successRate: 0,
        lastAnalysis: null
      };
    }

    const totalAnalyses = this.performanceMetrics.length;
    const avgAnalysisTime = this.performanceMetrics.reduce((sum, m) => sum + m.totalAnalysisTime, 0) / totalAnalyses;
    const avgMemories = this.performanceMetrics.reduce((sum, m) => sum + m.totalMemoriesExtracted, 0) / totalAnalyses;
    const avgApiCalls = this.performanceMetrics.reduce((sum, m) => sum + m.totalApiCalls, 0) / totalAnalyses;
    const successRate = this.performanceMetrics.filter(m => m.errors.length === 0).length / totalAnalyses;

    return {
      totalAnalyses,
      averageAnalysisTime: avgAnalysisTime,
      averageMemoriesPerAnalysis: avgMemories,
      averageApiCallsPerAnalysis: avgApiCalls,
      successRate,
      lastAnalysis: this.performanceMetrics[this.performanceMetrics.length - 1]?.timestamp || null
    };
  }

  /**
   * Limpia métricas de rendimiento
   */
  static clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
    console.log('[BatchMemoryAnalysisService] Métricas de rendimiento limpiadas');
  }

  /**
   * Actualiza la configuración de análisis
   */
  static updateConfig(newConfig: Partial<BatchAnalysisConfig>): void {
    Object.assign(this.DEFAULT_CONFIG, newConfig);
    console.log('[BatchMemoryAnalysisService] Configuración actualizada:', this.DEFAULT_CONFIG);
  }

  /**
   * Obtiene la configuración actual
   */
  static getConfig(): BatchAnalysisConfig {
    return { ...this.DEFAULT_CONFIG };
  }
} 