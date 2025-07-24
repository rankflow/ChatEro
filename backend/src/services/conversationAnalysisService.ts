import MemoryService from './memoryService.js';

interface ConversationAnalysis {
  isRelevant: boolean;
  memoryType: string;
  extractedContent: string;
  confidence: number;
  context: string;
}

interface AnalysisResult {
  newMemories: number;
  updatedMemories: number;
  analysisTime: number;
}

class ConversationAnalysisService {
  private static readonly RELEVANCE_THRESHOLD = 0.7;
  private static readonly MEMORY_TYPES = [
    'personal_info',
    'preferences', 
    'anecdotes',
    'behavior_patterns',
    'emotional_state',
    'interests',
    'relationships',
    'goals',
    'fears',
    'dreams'
  ];

  /**
   * Analiza una conversación y extrae información relevante para la memoria
   */
  static async analyzeConversation(
    userId: string,
    avatarId: string,
    userMessage: string,
    aiResponse: string,
    conversationContext?: string
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    let newMemories = 0;
    let updatedMemories = 0;

    try {
      console.log(`[ConversationAnalysis] Analizando conversación para usuario ${userId}, avatar ${avatarId}`);

      // Analizar mensaje del usuario (memoryOwner: 'user')
      const userAnalysis = await this.analyzeMessage(userMessage, 'user');
      if (userAnalysis.isRelevant) {
        await this.saveMemoryFromAnalysis(userId, avatarId, userAnalysis, 'user');
        newMemories++;
      }

      // Analizar respuesta de la IA (memoryOwner: 'avatar')
      const aiAnalysis = await this.analyzeMessage(aiResponse, 'ai');
      if (aiAnalysis.isRelevant) {
        await this.saveMemoryFromAnalysis(userId, avatarId, aiAnalysis, 'avatar');
        newMemories++;
      }

      // Analizar contexto de conversación si existe (memoryOwner: 'user' por defecto)
      if (conversationContext) {
        const contextAnalysis = await this.analyzeMessage(conversationContext, 'context');
        if (contextAnalysis.isRelevant) {
          await this.saveMemoryFromAnalysis(userId, avatarId, contextAnalysis, 'user');
          newMemories++;
        }
      }

      const analysisTime = Date.now() - startTime;
      console.log(`[ConversationAnalysis] Análisis completado en ${analysisTime}ms - ${newMemories} nuevas memorias`);

      return {
        newMemories,
        updatedMemories,
        analysisTime
      };

    } catch (error) {
      console.error('[ConversationAnalysis] Error analizando conversación:', error);
      return {
        newMemories: 0,
        updatedMemories: 0,
        analysisTime: Date.now() - startTime
      };
    }
  }

  /**
   * Analiza un mensaje individual para extraer información relevante
   */
  private static async analyzeMessage(
    message: string, 
    messageType: 'user' | 'ai' | 'context'
  ): Promise<ConversationAnalysis> {
    try {
      // Limpiar y normalizar el mensaje
      const cleanMessage = this.cleanMessage(message);
      
      // Detectar tipo de memoria basado en palabras clave
      const memoryType = this.detectMemoryType(cleanMessage);
      
      // Calcular confianza basada en la relevancia del contenido
      const confidence = this.calculateConfidence(cleanMessage, memoryType);
      
      // Extraer contenido relevante
      const extractedContent = this.extractRelevantContent(cleanMessage, memoryType);
      
      // Determinar si es relevante
      const isRelevant = confidence >= this.RELEVANCE_THRESHOLD && extractedContent.length > 10;

      return {
        isRelevant,
        memoryType,
        extractedContent,
        confidence,
        context: `Analizado de mensaje ${messageType}`
      };

    } catch (error) {
      console.error('[ConversationAnalysis] Error analizando mensaje:', error);
      return {
        isRelevant: false,
        memoryType: 'unknown',
        extractedContent: '',
        confidence: 0,
        context: 'Error en análisis'
      };
    }
  }

  /**
   * Guarda memoria basada en el análisis
   */
  private static async saveMemoryFromAnalysis(
    userId: string,
    avatarId: string,
    analysis: ConversationAnalysis,
    memoryOwner: 'user' | 'avatar'
  ): Promise<void> {
    try {
      if (analysis.isRelevant && analysis.extractedContent) {
        await MemoryService.saveMemory(
          userId,
          avatarId,
          analysis.memoryType,
          analysis.extractedContent,
          undefined, // memoryKey
          analysis.confidence,
          memoryOwner
        );
        
        console.log(`[ConversationAnalysis] ✅ Memoria guardada: ${analysis.memoryType} (${memoryOwner}) - ${analysis.extractedContent.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error('[ConversationAnalysis] Error guardando memoria:', error);
    }
  }

  /**
   * Limpia y normaliza un mensaje
   */
  private static cleanMessage(message: string): string {
    return message
      .toLowerCase()
      .replace(/[^\w\sáéíóúñ]/g, ' ') // Remover caracteres especiales
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  /**
   * Detecta el tipo de memoria basado en palabras clave
   */
  private static detectMemoryType(message: string): string {
    const keywordPatterns = {
      'personal_info': [
        'me llamo', 'mi nombre', 'soy', 'tengo', 'vivo en', 'nací', 'mi edad'
      ],
      'preferences': [
        'me gusta', 'prefiero', 'disfruto', 'odio', 'no me gusta', 'favorito', 'me encanta'
      ],
      'anecdotes': [
        'una vez', 'cuando', 'recuerdo', 'pasó', 'aconteció', 'experiencia'
      ],
      'behavior_patterns': [
        'siempre', 'nunca', 'suelo', 'acostumbro', 'típicamente', 'normalmente'
      ],
      'emotional_state': [
        'me siento', 'estoy', 'feliz', 'triste', 'enojado', 'nervioso', 'ansioso'
      ],
      'interests': [
        'hobby', 'pasatiempo', 'música', 'películas', 'libros', 'deportes', 'arte'
      ],
      'relationships': [
        'mi pareja', 'mi familia', 'amigos', 'hermano', 'hermana', 'padres'
      ],
      'goals': [
        'quiero', 'deseo', 'objetivo', 'meta', 'plan', 'aspiración', 'sueño'
      ],
      'fears': [
        'miedo', 'temor', 'ansiedad', 'preocupación', 'angustia', 'pánico'
      ],
      'dreams': [
        'sueño', 'fantasía', 'imaginación', 'deseo profundo', 'aspiración'
      ]
    };

    for (const [memoryType, keywords] of Object.entries(keywordPatterns)) {
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          return memoryType;
        }
      }
    }

    return 'general';
  }

  /**
   * Calcula la confianza de que el mensaje contiene información relevante
   */
  private static calculateConfidence(message: string, memoryType: string): number {
    let confidence = 0.3; // Confianza base

    // Aumentar confianza por longitud del mensaje
    if (message.length > 50) confidence += 0.2;
    if (message.length > 100) confidence += 0.1;

    // Aumentar confianza por tipo de memoria específico
    if (memoryType !== 'general') confidence += 0.3;

    // Aumentar confianza por presencia de palabras personales
    const personalWords = ['yo', 'mi', 'me', 'mío', 'mía', 'míos', 'mías'];
    const personalWordCount = personalWords.filter(word => message.includes(word)).length;
    confidence += personalWordCount * 0.1;

    // Aumentar confianza por presencia de emociones
    const emotionWords = ['feliz', 'triste', 'enojado', 'nervioso', 'excitado', 'sorprendido'];
    const emotionWordCount = emotionWords.filter(word => message.includes(word)).length;
    confidence += emotionWordCount * 0.15;

    return Math.min(confidence, 1.0);
  }

  /**
   * Extrae contenido relevante del mensaje
   */
  private static extractRelevantContent(message: string, memoryType: string): string {
    // Para tipos específicos, extraer frases relevantes
    if (memoryType === 'personal_info') {
      return this.extractPersonalInfo(message);
    } else if (memoryType === 'preferences') {
      return this.extractPreferences(message);
    } else if (memoryType === 'anecdotes') {
      return this.extractAnecdotes(message);
    } else if (memoryType === 'emotional_state') {
      return this.extractEmotionalState(message);
    }

    // Para otros tipos, extraer frases que contengan información personal
    return this.extractGeneralRelevantContent(message);
  }

  /**
   * Extrae información personal
   */
  private static extractPersonalInfo(message: string): string {
    const patterns = [
      /me llamo\s+(\w+)/i,
      /mi nombre\s+es\s+(\w+)/i,
      /soy\s+(\w+)/i,
      /tengo\s+(\d+)\s+años/i,
      /vivo\s+en\s+([^.!?]+)/i,
      /nací\s+en\s+([^.!?]+)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return message.substring(0, 100);
  }

  /**
   * Extrae preferencias
   */
  private static extractPreferences(message: string): string {
    const preferencePatterns = [
      /me gusta\s+([^.!?]+)/i,
      /prefiero\s+([^.!?]+)/i,
      /disfruto\s+([^.!?]+)/i,
      /me encanta\s+([^.!?]+)/i,
      /odio\s+([^.!?]+)/i,
      /no me gusta\s+([^.!?]+)/i
    ];

    for (const pattern of preferencePatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return message.substring(0, 100);
  }

  /**
   * Extrae anécdotas
   */
  private static extractAnecdotes(message: string): string {
    const anecdotePatterns = [
      /una vez\s+([^.!?]+)/i,
      /cuando\s+([^.!?]+)/i,
      /recuerdo\s+([^.!?]+)/i,
      /pasó\s+([^.!?]+)/i
    ];

    for (const pattern of anecdotePatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return message.substring(0, 100);
  }

  /**
   * Extrae estado emocional
   */
  private static extractEmotionalState(message: string): string {
    const emotionPatterns = [
      /me siento\s+([^.!?]+)/i,
      /estoy\s+([^.!?]+)/i,
      /me siento\s+(\w+)/i,
      /estoy\s+(\w+)/i
    ];

    for (const pattern of emotionPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return message.substring(0, 100);
  }

  /**
   * Extrae contenido relevante general
   */
  private static extractGeneralRelevantContent(message: string): string {
    // Buscar frases que contengan información personal
    const sentences = message.split(/[.!?]/);
    const relevantSentences = sentences.filter(sentence => {
      const cleanSentence = sentence.trim().toLowerCase();
      return cleanSentence.length > 10 && 
             (cleanSentence.includes('yo') || 
              cleanSentence.includes('mi') || 
              cleanSentence.includes('me') ||
              cleanSentence.includes('tengo') ||
              cleanSentence.includes('soy') ||
              cleanSentence.includes('disfruto') ||
              cleanSentence.includes('gusta'));
    });

    if (relevantSentences.length > 0) {
      return relevantSentences[0].trim();
    }

    return message.substring(0, 100);
  }

  /**
   * Obtiene estadísticas de análisis de conversación
   */
  static async getAnalysisStats(userId: string): Promise<{
    totalAnalyses: number;
    newMemoriesCreated: number;
    averageAnalysisTime: number;
    memoryTypeDistribution: Record<string, number>;
  }> {
    try {
      // Por ahora retornamos estadísticas básicas
      // En el futuro se pueden implementar métricas más detalladas
      return {
        totalAnalyses: 0,
        newMemoriesCreated: 0,
        averageAnalysisTime: 0,
        memoryTypeDistribution: {}
      };
    } catch (error) {
      console.error('[ConversationAnalysis] Error obteniendo estadísticas:', error);
      return {
        totalAnalyses: 0,
        newMemoriesCreated: 0,
        averageAnalysisTime: 0,
        memoryTypeDistribution: {}
      };
    }
  }
}

export default ConversationAnalysisService; 