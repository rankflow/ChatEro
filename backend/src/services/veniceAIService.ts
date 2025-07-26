import dotenv from 'dotenv';
import { RetryService } from './retryService.js';
import { MetricsService } from './metricsService.js';

dotenv.config();

interface VeniceAnalysis {
  user_preferences: string[];
  avatar_preferences: string[];
  shared_dynamics: string[];
  detected_categories: Record<string, string[]>;
}

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

interface CategorizedMemories {
  gustos: string[];
  sexualidad: string[];
  relaciones: string[];
  historia_personal: string[];
  emociones: string[];
  cualidades_personales: string[];
  anecdotas: string[];
  otros: string[];
}

export class VeniceAIService {
  private static readonly VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/v1';
  private static readonly VENICE_API_KEY = process.env.VENICE_API_KEY;
  private static readonly VENICE_MODEL = process.env.VENICE_MODEL || 'venice-3-large';

  /**
   * Analiza una conversación usando Venice AI para extraer memorias
   */
  static async analyzeConversation(conversationText: string): Promise<VeniceAnalysis> {
    const startTime = Date.now();
    const conversationLength = conversationText.length;
    
    console.log(`[VeniceAIService] 🚀 Iniciando análisis de conversación (${conversationLength} caracteres)...`);

    if (!this.VENICE_API_KEY) {
      throw new Error('VENICE_API_KEY no configurada');
    }

    console.log(`[VeniceAIService] 📝 Construyendo prompt de análisis...`);
    const prompt = this.buildAnalysisPrompt(conversationText);
    
    // Usar sistema de reintentos
    const retryResult = await RetryService.withRetry(
      async () => {
        console.log(`[VeniceAIService] 🌐 Enviando solicitud a Venice AI (${this.VENICE_MODEL})...`);
        
        const response = await fetch(`${this.VENICE_API_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.VENICE_API_KEY}`
          },
          body: JSON.stringify({
            model: this.VENICE_MODEL,
            messages: [
              {
                role: 'system',
                content: 'Eres un analista experto en extraer información personal y preferencias de conversaciones. Debes identificar memorias importantes sobre gustos, cualidades, historia personal, etc.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errorMsg = `Error en Venice AI: ${response.status} - ${errorText}`;
          console.error(`[VeniceAIService] ❌ ${errorMsg}`);
          throw new Error(errorMsg);
        }

        console.log(`[VeniceAIService] ✅ Respuesta recibida de Venice AI`);
        const data = await response.json();
        const analysisText = data.choices[0]?.message?.content;

        if (!analysisText) {
          throw new Error('Respuesta vacía de Venice AI');
        }

        console.log(`[VeniceAIService] 🔍 Parseando respuesta de Venice AI...`);
        const analysis = this.parseVeniceResponse(analysisText);
        
        return analysis;
      },
      RetryService.getAIAPIConfig()
    );

    if (!retryResult.success) {
      console.error(`[VeniceAIService] ❌ Análisis falló después de ${retryResult.attempts} intentos`);
      MetricsService.recordAPICall('venice', false, Date.now() - startTime);
      throw retryResult.error;
    }

    const analysisTime = Date.now() - startTime;
    MetricsService.recordAPICall('venice', true, analysisTime);
    console.log(`[VeniceAIService] ✅ Análisis completado exitosamente en ${analysisTime}ms (${retryResult.attempts} intentos)`);
    return retryResult.data!;
  }

  /**
   * Extrae memorias de una conversación
   */
  static async extractMemories(conversationText: string): Promise<ExtractedMemories> {
    const startTime = Date.now();
    
    try {
      console.log(`[VeniceAIService] 🧠 Iniciando extracción de memorias...`);
      
      const analysis = await this.analyzeConversation(conversationText);
      console.log(`[VeniceAIService] 🔄 Convirtiendo análisis a memorias...`);
      const memories = this.convertAnalysisToMemories(analysis);
      
      const totalMemories = memories.userMemories.length + memories.avatarMemories.length + memories.sharedMemories.length;
      const extractionTime = Date.now() - startTime;
      console.log(`[VeniceAIService] ✅ Extraídas ${totalMemories} memorias en ${extractionTime}ms`);
      console.log(`[VeniceAIService] 📊 Desglose: ${memories.userMemories.length} usuario, ${memories.avatarMemories.length} avatar, ${memories.sharedMemories.length} compartidas`);
      
      return memories;

    } catch (error) {
      console.error(`[VeniceAIService] ❌ Error al extraer memorias:`, error);
      throw error;
    }
  }

  /**
   * Categoriza memorias por tipo
   */
  static async categorizeMemories(memories: string[]): Promise<CategorizedMemories> {
    try {
      console.log('[VeniceAIService] Categorizando memorias...');
      
      const categories: CategorizedMemories = {
        gustos: [],
        sexualidad: [],
        relaciones: [],
        historia_personal: [],
        emociones: [],
        cualidades_personales: [],
        anecdotas: [],
        otros: []
      };

      for (const memory of memories) {
        const category = this.determineMemoryCategory(memory);
        categories[category].push(memory);
      }

      console.log('[VeniceAIService] Categorización completada');
      return categories;

    } catch (error) {
      console.error('[VeniceAIService] Error categorizando memorias:', error);
      throw error;
    }
  }

  /**
   * Construye el prompt para Venice AI
   */
  private static buildAnalysisPrompt(conversationText: string): string {
    return `
Analiza esta conversación y extrae memorias importantes:

CONVERSACIÓN:
${conversationText}

INSTRUCCIONES:
- Identifica preferencias, gustos, información personal
- Distingue entre información del usuario y del avatar
- Categoriza en: gustos, sexualidad, relaciones, historia_personal, emociones, cualidades_personales, anecdotas, otros
- Extrae información específica y relevante
- Identifica patrones de comportamiento y preferencias

DEVUELVE UN JSON CON ESTA ESTRUCTURA:
{
  "user_preferences": [
    "Le gusta la música rock y jazz",
    "Es ingeniero de 38 años"
  ],
  "avatar_preferences": [
    "Es estudiante italiana de 19 años",
    "Vive en Madrid"
  ],
  "shared_dynamics": [
    "Conversación amistosa y curiosa",
    "Tono dulce y respetuoso"
  ],
  "detected_categories": {
    "gustos": ["música", "estudios"],
    "cualidades_personales": ["curiosa", "tímida"],
    "historia_personal": ["estudiante de intercambio"],
    "emociones": ["nerviosa al hablar español"]
  }
}

IMPORTANTE:
- Solo extrae información relevante y específica
- Usa categorías exactas de la lista
- Si no hay información de un tipo, devuelve array vacío
- Responde SOLO con el JSON, sin texto adicional
`;
  }

  /**
   * Parsea la respuesta de Venice AI
   */
  private static parseVeniceResponse(responseText: string): VeniceAnalysis {
    try {
      // Limpiar la respuesta (eliminar markdown si existe)
      const cleanResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const analysis = JSON.parse(cleanResponse);
      
      // Validar estructura
      if (!analysis.user_preferences || !analysis.avatar_preferences || !analysis.shared_dynamics || !analysis.detected_categories) {
        throw new Error('Respuesta de Venice AI no tiene la estructura esperada');
      }

      return {
        user_preferences: Array.isArray(analysis.user_preferences) ? analysis.user_preferences : [],
        avatar_preferences: Array.isArray(analysis.avatar_preferences) ? analysis.avatar_preferences : [],
        shared_dynamics: Array.isArray(analysis.shared_dynamics) ? analysis.shared_dynamics : [],
        detected_categories: analysis.detected_categories || {}
      };

    } catch (error) {
      console.error('[VeniceAIService] Error parseando respuesta:', error);
      console.error('[VeniceAIService] Respuesta recibida:', responseText);
      
      // Fallback: respuesta básica
      return {
        user_preferences: [],
        avatar_preferences: [],
        shared_dynamics: [],
        detected_categories: {}
      };
    }
  }

  /**
   * Convierte el análisis de Venice a formato de memorias
   */
  static convertAnalysisToMemories(analysis: VeniceAnalysis): ExtractedMemories {
    const userMemories: Array<{ category: string; content: string; tags?: string[] }> = [];
    const avatarMemories: Array<{ category: string; content: string; tags?: string[] }> = [];
    const sharedMemories: Array<{ category: string; content: string; tags?: string[] }> = [];

    // Procesar preferencias del usuario
    for (const preference of analysis.user_preferences) {
      const category = this.determineMemoryCategory(preference);
      userMemories.push({
        category,
        content: preference,
        tags: this.extractTags(preference, category)
      });
    }

    // Procesar preferencias del avatar
    for (const preference of analysis.avatar_preferences) {
      const category = this.determineMemoryCategory(preference);
      avatarMemories.push({
        category,
        content: preference,
        tags: this.extractTags(preference, category)
      });
    }

    // Procesar dinámicas compartidas
    for (const dynamic of analysis.shared_dynamics) {
      const category = this.determineMemoryCategory(dynamic);
      sharedMemories.push({
        category,
        content: dynamic,
        tags: this.extractTags(dynamic, category)
      });
    }

    return {
      userMemories,
      avatarMemories,
      sharedMemories
    };
  }

  /**
   * Determina la categoría de una memoria
   */
  private static determineMemoryCategory(memory: string): string {
    const lowerMemory = memory.toLowerCase();
    
    // Gustos
    if (lowerMemory.includes('gusta') || lowerMemory.includes('prefiere') || lowerMemory.includes('favorito') ||
        lowerMemory.includes('música') || lowerMemory.includes('comida') || lowerMemory.includes('deporte') ||
        lowerMemory.includes('cine') || lowerMemory.includes('libro') || lowerMemory.includes('juego')) {
      return 'gustos';
    }
    
    // Sexualidad
    if (lowerMemory.includes('sexual') || lowerMemory.includes('íntimo') || lowerMemory.includes('placer') ||
        lowerMemory.includes('fetiche') || lowerMemory.includes('fantasía')) {
      return 'sexualidad';
    }
    
    // Relaciones
    if (lowerMemory.includes('relación') || lowerMemory.includes('pareja') || lowerMemory.includes('amor') ||
        lowerMemory.includes('cariño') || lowerMemory.includes('apodo') || lowerMemory.includes('dinámica')) {
      return 'relaciones';
    }
    
    // Historia personal
    if (lowerMemory.includes('edad') || lowerMemory.includes('trabajo') || lowerMemory.includes('estudios') ||
        lowerMemory.includes('familia') || lowerMemory.includes('pasado') || lowerMemory.includes('experiencia')) {
      return 'historia_personal';
    }
    
    // Emociones
    if (lowerMemory.includes('feliz') || lowerMemory.includes('triste') || lowerMemory.includes('nervioso') ||
        lowerMemory.includes('emocionado') || lowerMemory.includes('asustado') || lowerMemory.includes('enojado')) {
      return 'emociones';
    }
    
    // Cualidades personales
    if (lowerMemory.includes('inteligente') || lowerMemory.includes('tímido') || lowerMemory.includes('extrovertido') ||
        lowerMemory.includes('curioso') || lowerMemory.includes('amable') || lowerMemory.includes('creativo')) {
      return 'cualidades_personales';
    }
    
    // Anécdotas
    if (lowerMemory.includes('viaje') || lowerMemory.includes('historia') || lowerMemory.includes('ocurrió') ||
        lowerMemory.includes('vez') || lowerMemory.includes('experiencia')) {
      return 'anecdotas';
    }
    
    return 'otros';
  }

  /**
   * Extrae tags de una memoria
   */
  private static extractTags(memory: string, category: string): string[] {
    const tags: string[] = [];
    const lowerMemory = memory.toLowerCase();
    
    // Tags por categoría
    switch (category) {
      case 'gustos':
        if (lowerMemory.includes('música')) tags.push('música');
        if (lowerMemory.includes('comida')) tags.push('comida');
        if (lowerMemory.includes('deporte')) tags.push('deporte');
        if (lowerMemory.includes('cine')) tags.push('cine');
        break;
      case 'cualidades_personales':
        if (lowerMemory.includes('inteligente')) tags.push('inteligente');
        if (lowerMemory.includes('tímido')) tags.push('tímido');
        if (lowerMemory.includes('curioso')) tags.push('curioso');
        break;
      case 'historia_personal':
        if (lowerMemory.includes('edad')) tags.push('edad');
        if (lowerMemory.includes('trabajo')) tags.push('trabajo');
        if (lowerMemory.includes('estudios')) tags.push('estudios');
        break;
    }
    
    return tags;
  }

  /**
   * Procesa mensajes en lote para análisis batch
   */
  static async processBatchMessages(messages: any[], userId: string, avatarId: string): Promise<void> {
    try {
      console.log(`[VeniceAIService] Procesando ${messages.length} mensajes en lote...`);
      
      if (messages.length === 0) {
        console.log('[VeniceAIService] No hay mensajes para procesar');
        return;
      }

      // Combinar todos los mensajes en un solo texto
      const conversationText = messages
        .map(msg => `${msg.isUser ? 'Usuario' : 'Avatar'}: ${msg.content}`)
        .join('\n');

      console.log(`[VeniceAIService] Texto combinado: ${conversationText.length} caracteres`);

      // Analizar conversación con Venice AI
      const analysis = await this.analyzeConversation(conversationText);
      
      // Convertir análisis a memorias
      const memories = this.convertAnalysisToMemories(analysis);
      
      // Guardar memorias en la base de datos
      await this.saveMemoriesToDatabase(memories, userId, avatarId);
      
      console.log(`[VeniceAIService] Procesamiento batch completado`);
    } catch (error) {
      console.error('[VeniceAIService] Error procesando mensajes en lote:', error);
      throw error;
    }
  }

  /**
   * Guarda memorias en la base de datos
   */
  private static async saveMemoriesToDatabase(memories: ExtractedMemories, userId: string, avatarId: string): Promise<void> {
    try {
      // Importar DatabaseService dinámicamente para evitar dependencias circulares
      const { DatabaseService } = await import('./database.js');
      
      // Guardar memorias del usuario
      for (const memory of memories.userMemories) {
        await DatabaseService.saveUserMemory({
          userId,
          avatarId,
          memoryType: 'user',
          memoryKey: memory.category,
          categoryId: 1, // Categoría por defecto
          memoryContent: memory.content,
          memoryVector: '', // Se generará después
          memoryOwner: 'user',
          source: 'batch_analysis',
          tags: memory.tags?.join(',') || ''
        });
      }

      // Guardar memorias del avatar
      for (const memory of memories.avatarMemories) {
        await DatabaseService.saveUserMemory({
          userId,
          avatarId,
          memoryType: 'avatar',
          memoryKey: memory.category,
          categoryId: 1, // Categoría por defecto
          memoryContent: memory.content,
          memoryVector: '', // Se generará después
          memoryOwner: 'avatar',
          source: 'batch_analysis',
          tags: memory.tags?.join(',') || ''
        });
      }

      console.log(`[VeniceAIService] Memorias guardadas: ${memories.userMemories.length} usuario, ${memories.avatarMemories.length} avatar`);
    } catch (error) {
      console.error('[VeniceAIService] Error guardando memorias:', error);
      throw error;
    }
  }

  /**
   * Verifica la conectividad con Venice AI
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('[VeniceAIService] Probando conexión con Venice AI...');
      
      if (!this.VENICE_API_KEY) {
        console.error('[VeniceAIService] ❌ VENICE_API_KEY no configurada');
        return false;
      }

      const testAnalysis = await this.analyzeConversation('Hola, me gusta la música rock');
      
      if (testAnalysis.user_preferences.length > 0) {
        console.log('[VeniceAIService] ✅ Conexión exitosa con Venice AI');
        return true;
      } else {
        console.error('[VeniceAIService] ❌ Respuesta vacía de Venice AI');
        return false;
      }
    } catch (error) {
      console.error('[VeniceAIService] ❌ Error de conexión:', error);
      return false;
    }
  }
}

export default VeniceAIService; 