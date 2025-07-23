import dotenv from 'dotenv';

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
    try {
      console.log(`[VoyageEmbeddingService] Generando embedding para: "${text.substring(0, 50)}..."`);
      
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
        console.error(`[VoyageEmbeddingService] Error API: ${response.status} - ${errorText}`);
        throw new Error(`Voyage API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;
      
      console.log(`[VoyageEmbeddingService] Embedding generado: ${embedding.length} dimensiones`);
      return embedding; // Vector de 1024 dimensiones
    } catch (error) {
      console.error('[VoyageEmbeddingService] Error generating Voyage embedding:', error);
      throw error;
    }
  }

  /**
   * Genera embeddings para múltiples textos (batch processing)
   */
  static async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      console.log(`[VoyageEmbeddingService] Generando batch de ${texts.length} embeddings`);
      
      const batches = this.chunkArray(texts, this.config.batchSize);
      const allEmbeddings: number[][] = [];

      for (const batch of batches) {
        try {
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
            throw new Error(`Voyage API batch error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          const batchEmbeddings = data.data.map((item: any) => item.embedding);
          allEmbeddings.push(...batchEmbeddings);
          
          console.log(`[VoyageEmbeddingService] Batch procesado: ${batchEmbeddings.length} embeddings`);
        } catch (error) {
          console.error('[VoyageEmbeddingService] Error in batch embedding generation:', error);
          throw error;
        }
      }

      console.log(`[VoyageEmbeddingService] Total embeddings generados: ${allEmbeddings.length}`);
      return allEmbeddings;
    } catch (error) {
      console.error('[VoyageEmbeddingService] Error in batch processing:', error);
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
}

export default VoyageEmbeddingService; 