import * as dotenv from 'dotenv';
import { RetryService } from './retryService.js';
import { MetricsService } from './metricsService.js';

// Cargar variables de entorno
dotenv.config();

interface VoyageEmbeddingConfig {
  model: string;
  dimensions: number;
  similarityThreshold: number;
  batchSize: number;
  cacheDuration: number;
}

class VoyageEmbeddingService {
  private static readonly VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
  private static readonly VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
  private static readonly MODEL = 'voyage-3-large';
  private static readonly DIMENSIONS = 1024;
  
  private static config: VoyageEmbeddingConfig = {
    model: 'voyage-3-large',
    dimensions: 1024,
    similarityThreshold: 0.85,
    batchSize: 10,
    cacheDuration: 3600 // 1 hora
  };

  /**
   * Genera embedding para un texto individual
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    const startTime = Date.now();
    const textLength = text.length;
    
    console.log(`[VoyageEmbeddingService] 🚀 Generando embedding para texto (${textLength} chars): "${text.substring(0, 50)}..."`);
    
    // Usar sistema de reintentos
    const retryResult = await RetryService.withRetry(
      async () => {
        const response = await fetch(this.VOYAGE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.VOYAGE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.MODEL,
            input: text
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errorMsg = `Voyage API error: ${response.status} - ${errorText}`;
          console.error(`[VoyageEmbeddingService] ❌ ${errorMsg}`);
          throw new Error(errorMsg);
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;
        
        return embedding; // Vector de 1024 dimensiones
      },
      RetryService.getAIAPIConfig()
    );

    if (!retryResult.success) {
      console.error(`[VoyageEmbeddingService] ❌ Generación de embedding falló después de ${retryResult.attempts} intentos`);
      MetricsService.recordAPICall('voyage', false, Date.now() - startTime);
      throw retryResult.error;
    }

    const generationTime = Date.now() - startTime;
    MetricsService.recordAPICall('voyage', true, generationTime);
    console.log(`[VoyageEmbeddingService] ✅ Embedding generado: ${retryResult.data!.length} dimensiones en ${generationTime}ms (${retryResult.attempts} intentos)`);
    return retryResult.data!;
  }

  /**
   * Genera embeddings para múltiples textos (batch processing)
   */
  static async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const startTime = Date.now();
    const totalTexts = texts.length;
    
    try {
      console.log(`[VoyageEmbeddingService] 🚀 Generando batch de ${totalTexts} embeddings...`);
      
      const batches = this.chunkArray(texts, this.config.batchSize);
      const allEmbeddings: number[][] = [];
      let processedBatches = 0;

      console.log(`[VoyageEmbeddingService] 📦 Dividido en ${batches.length} batches de máximo ${this.config.batchSize} textos`);

      for (const batch of batches) {
        const batchStartTime = Date.now();
        try {
          console.log(`[VoyageEmbeddingService] 🔄 Procesando batch ${processedBatches + 1}/${batches.length} (${batch.length} textos)...`);
          
          const response = await fetch(this.VOYAGE_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.VOYAGE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: this.MODEL,
              input: batch
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            const errorMsg = `Voyage API batch error: ${response.status} - ${errorText}`;
            console.error(`[VoyageEmbeddingService] ❌ ${errorMsg}`);
            throw new Error(errorMsg);
          }

          const data = await response.json();
          const batchEmbeddings = data.data.map((item: any) => item.embedding);
          allEmbeddings.push(...batchEmbeddings);
          
          const batchTime = Date.now() - batchStartTime;
          processedBatches++;
          console.log(`[VoyageEmbeddingService] ✅ Batch ${processedBatches}/${batches.length} procesado: ${batchEmbeddings.length} embeddings en ${batchTime}ms`);
        } catch (error) {
          console.error(`[VoyageEmbeddingService] ❌ Error en batch ${processedBatches + 1}:`, error);
          throw error;
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`[VoyageEmbeddingService] ✅ Batch completado: ${allEmbeddings.length} embeddings generados en ${totalTime}ms`);
      return allEmbeddings;
    } catch (error) {
      console.error(`[VoyageEmbeddingService] ❌ Error en procesamiento de batch:`, error);
      throw error;
    }
  }

  /**
   * Calcula similitud coseno entre dos vectores
   */
  static calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }

    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Valida que un embedding tenga las dimensiones correctas
   */
  static validateEmbedding(embedding: number[]): boolean {
    return embedding.length === this.DIMENSIONS && 
           embedding.every(val => typeof val === 'number' && !isNaN(val));
  }

  /**
   * Obtiene la configuración actual del servicio
   */
  static getConfig(): VoyageEmbeddingConfig {
    return { ...this.config };
  }

  /**
   * Actualiza la configuración del servicio
   */
  static updateConfig(newConfig: Partial<VoyageEmbeddingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log(`[VoyageEmbeddingService] Configuración actualizada:`, this.config);
  }

  /**
   * Divide un array en chunks del tamaño especificado
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Verifica la conectividad con Voyage AI
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('[VoyageEmbeddingService] Probando conexión con Voyage AI...');
      
      const testEmbedding = await this.generateEmbedding('test');
      
      if (this.validateEmbedding(testEmbedding)) {
        console.log('[VoyageEmbeddingService] ✅ Conexión exitosa con Voyage AI');
        return true;
      } else {
        console.error('[VoyageEmbeddingService] ❌ Embedding inválido recibido');
        return false;
      }
    } catch (error) {
      console.error('[VoyageEmbeddingService] ❌ Error de conexión:', error);
      return false;
    }
  }

  /**
   * Analiza texto completo usando Voyage AI para extraer memorias
   */
  static async analyzeWithVoyage(prompt: string): Promise<string> {
    try {
      console.log('[VoyageEmbeddingService] Analizando texto con Voyage AI...');
      
      // Usar la API de embeddings de Voyage para análisis de texto
      // Nota: Voyage AI actualmente solo soporta embeddings, no análisis de texto completo
      // Para análisis de texto necesitaríamos una API diferente como OpenAI GPT
      
      // Por ahora, simulamos el análisis usando embeddings y procesamiento local
      const embedding = await this.generateEmbedding(prompt);
      
      // TODO: Implementar análisis completo cuando Voyage AI soporte análisis de texto
      // Por ahora, devolvemos un JSON básico basado en el contenido del prompt
      
      const analysisResult = this.simulateTextAnalysis(prompt);
      
      console.log('[VoyageEmbeddingService] Análisis completado');
      return JSON.stringify(analysisResult);
      
    } catch (error) {
      console.error('[VoyageEmbeddingService] Error en análisis con Voyage AI:', error);
      throw error;
    }
  }

  /**
   * Simula análisis de texto (temporal hasta que Voyage AI soporte análisis completo)
   */
  private static simulateTextAnalysis(prompt: string): any {
    // Extraer la conversación del prompt
    const conversationMatch = prompt.match(/CONVERSACIÓN:\s*([\s\S]*?)(?=\n\nEXTRACTA:|$)/);
    const conversationText = conversationMatch ? conversationMatch[1].trim() : '';
    
    const userMemories: any[] = [];
    const avatarMemories: any[] = [];
    const sharedMemories: any[] = [];
    
    // Análisis básico por líneas
    const lines = conversationText.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('Usuario:')) {
        const content = line.replace('Usuario:', '').trim();
        
        // Detectar gustos musicales
        if (content.match(/me gusta|me encanta|amo|prefiero|favorito/i) && 
            content.match(/música|música|rock|jazz|pop|clásica|electrónica/i)) {
          userMemories.push({
            category: 'gustos.musica',
            content: content,
            tags: ['música', 'gustos']
          });
        }
        
        // Detectar gustos gastronómicos
        if (content.match(/me gusta|me encanta|amo|prefiero|favorito/i) && 
            content.match(/comida|pizza|pasta|sushi|carne|pescado/i)) {
          userMemories.push({
            category: 'gustos.comida',
            content: content,
            tags: ['comida', 'gustos']
          });
        }
      }
      
      if (line.startsWith('Avatar:')) {
        const content = line.replace('Avatar:', '').trim();
        
        // Detectar gustos musicales del avatar
        if (content.match(/me gusta|me encanta|amo|prefiero|favorito/i) && 
            content.match(/música|música|rock|jazz|pop|clásica|electrónica/i)) {
          avatarMemories.push({
            category: 'gustos.musica',
            content: content,
            tags: ['música', 'gustos']
          });
        }
        
        // Detectar habilidades del avatar
        if (content.match(/toco|toca|tocar|tocar|cantar|canto|bailar|bailo/i)) {
          avatarMemories.push({
            category: 'cualidades_personales',
            content: content,
            tags: ['habilidades', 'cualidades']
          });
        }
      }
    }
    
    return {
      user_memories: userMemories,
      avatar_memories: avatarMemories,
      shared_memories: sharedMemories
    };
  }
}

export default VoyageEmbeddingService; 