import { Avatar } from '../types/index.js';
import { CharacterDevelopmentService } from './characterDevelopment';
import { getVeniceResponse } from './veniceAI.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatContext {
  avatar?: Avatar;
  conversationHistory: ChatMessage[];
  userPreferences?: string;
  conversationMemory?: ConversationMemory;
}

export interface ConversationMemory {
  summary: string;
  turnCount: number;
  lastUpdated: Date;
  userRevelations: string[];
  dominantTone: string;
  avatarIntroduced: boolean;
  boundariesDiscussed: string[];
  fantasiesExplored: string[];
}

export class AIService {
  private static readonly MEMORY_UPDATE_INTERVAL = 10; // Actualizar memoria cada 10 turnos
  private static readonly RECENT_MESSAGES_LIMIT = 10; // Últimos 10 mensajes para contexto inmediato

  /**
   * Genera una respuesta del chat usando Venice Uncensored con memoria contextual
   */
  static async generateChatResponse(
    userMessage: string,
    context: ChatContext
  ): Promise<{ message: string; tokensUsed: number }> {
    try {
      console.log(`[generateChatResponse] Contexto recibido:`, {
        avatar: context.avatar ? `ID: ${context.avatar.id}, Name: ${context.avatar.name}` : 'undefined',
        historyLength: context.conversationHistory?.length || 0,
        hasMemory: !!context.conversationMemory
      });
      
      // Construir el prompt del sistema basado en el avatar
      const systemPrompt = await this.buildSystemPrompt(context.avatar?.id);
      
      // Actualizar memoria contextual si es necesario
      const updatedMemory = await this.updateConversationMemory(
        context.conversationHistory,
        context.conversationMemory,
        context.avatar?.id
      );

      // Construir mensajes con prompt, memoria y historial reciente
      const messages = await this.buildMessages(
        systemPrompt,
        updatedMemory,
        context.conversationHistory,
        userMessage
      );

      // Formatear mensajes para Venice
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Llamar a Venice
      const response = await getVeniceResponse(formattedMessages);
      
      return {
        message: response,
        tokensUsed: 0 // Venice no devuelve tokens usados
      };
    } catch (error) {
      console.error('Error en IA API:', error);
      throw new Error('Error de conexión con el servicio de IA. Por favor, intenta de nuevo en unos momentos.');
    }
  }

  /**
   * Construye el array de mensajes con prompt, memoria y historial
   */
  private static async buildMessages(
    systemPrompt: string,
    memory: ConversationMemory | undefined,
    conversationHistory: ChatMessage[],
    userMessage: string
  ): Promise<ChatMessage[]> {
    const messages: ChatMessage[] = [];

    // 1. Prompt del sistema (siempre presente)
    messages.push({ role: 'system', content: systemPrompt });

    // 2. Memoria contextual (si existe)
    if (memory && memory.summary) {
      const memoryPrompt = this.buildMemoryPrompt(memory);
      messages.push({ role: 'system', content: memoryPrompt });
    }

    // 3. Historial reciente (últimos 10 mensajes)
    const recentHistory = conversationHistory.slice(-this.RECENT_MESSAGES_LIMIT);
    messages.push(...recentHistory);

    // 4. Mensaje actual del usuario
    messages.push({ role: 'user', content: userMessage });

    console.log(`[VENICE] Mensajes enviados a Venice:`, JSON.stringify(messages, null, 2));

    return messages;
  }

  /**
   * Construye el prompt de memoria contextual
   */
  private static buildMemoryPrompt(memory: ConversationMemory): string {
    return `CONTEXTO DE LA CONVERSACIÓN ANTERIOR:

${memory.summary}

INFORMACIÓN IMPORTANTE:
- Tono predominante: ${memory.dominantTone}
- Avatar ya se presentó: ${memory.avatarIntroduced ? 'Sí' : 'No'}
- Límites discutidos: ${memory.boundariesDiscussed.join(', ') || 'Ninguno'}
- Fantasías exploradas: ${memory.fantasiesExplored.join(', ') || 'Ninguna'}

IMPORTANTE: Mantén la coherencia con este contexto. No te vuelvas a presentar si ya lo hiciste. Respeta los límites establecidos. Continúa con el tono y dinámica ya establecidos.`;
  }

  /**
   * Actualiza la memoria contextual de la conversación
   */
  private static async updateConversationMemory(
    conversationHistory: ChatMessage[],
    currentMemory: ConversationMemory | undefined,
    avatarId?: string
  ): Promise<ConversationMemory | undefined> {
    const turnCount = conversationHistory.filter(msg => msg.role === 'user').length;
    
    // Si no hay memoria o es hora de actualizarla
    if (!currentMemory || turnCount % this.MEMORY_UPDATE_INTERVAL === 0) {
      console.log(`[MEMORY] Actualizando memoria contextual en turno ${turnCount}`);
      
      try {
        const newMemory = await this.generateConversationMemory(
          conversationHistory,
          currentMemory,
          avatarId
        );
        
        console.log(`[MEMORY] Memoria actualizada: ${newMemory.summary.substring(0, 100)}...`);
        return newMemory;
      } catch (error) {
        console.error('[MEMORY] Error generando memoria:', error);
        return currentMemory; // Mantener memoria anterior si falla
      }
    }

    return currentMemory;
  }

  /**
   * Genera un resumen contextual de la conversación usando Venice
   */
  private static async generateConversationMemory(
    conversationHistory: ChatMessage[],
    previousMemory: ConversationMemory | undefined,
    avatarId?: string
  ): Promise<ConversationMemory> {
    // Preparar el historial para análisis
    const userMessages = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);
    
    const assistantMessages = conversationHistory
      .filter(msg => msg.role === 'assistant')
      .map(msg => msg.content);

    const analysisPrompt = `Analiza esta conversación y genera un resumen contextual conciso:

CONVERSACIÓN DEL USUARIO:
${userMessages.join('\n')}

RESPUESTAS DEL AVATAR:
${assistantMessages.join('\n')}

${previousMemory ? `MEMORIA ANTERIOR:
${previousMemory.summary}` : ''}

Genera un resumen que incluya:
1. Qué se ha revelado sobre el usuario
2. Qué tono ha predominado (sexual, dulce, emocional, dominante, sumiso, etc.)
3. Si el avatar ya se ha presentado
4. Qué límites o temas han salido
5. Qué fantasías o dinámicas se han insinuado

Formato: Resumen conciso de 10 oraciones máximo.`;

    try {
      const memoryMessages = [
        { role: 'system', content: 'Eres un asistente experto en analizar conversaciones y generar resúmenes contextuales concisos.' },
        { role: 'user', content: analysisPrompt }
      ];

      const summary = await getVeniceResponse(memoryMessages);
      
      // Extraer información específica del resumen
      const memory: ConversationMemory = {
        summary: summary,
        turnCount: conversationHistory.filter(msg => msg.role === 'user').length,
        lastUpdated: new Date(),
        userRevelations: this.extractUserRevelations(summary),
        dominantTone: this.extractDominantTone(summary),
        avatarIntroduced: this.extractAvatarIntroduced(summary),
        boundariesDiscussed: this.extractBoundaries(summary),
        fantasiesExplored: this.extractFantasies(summary)
      };

      return memory;
    } catch (error) {
      console.error('[MEMORY] Error generando memoria con Venice:', error);
      
      // Fallback: memoria básica
      return {
        summary: 'Conversación en progreso. Mantén coherencia con el contexto anterior.',
        turnCount: conversationHistory.filter(msg => msg.role === 'user').length,
        lastUpdated: new Date(),
        userRevelations: [],
        dominantTone: 'neutral',
        avatarIntroduced: false,
        boundariesDiscussed: [],
        fantasiesExplored: []
      };
    }
  }

  /**
   * Extrae revelaciones del usuario del resumen
   */
  private static extractUserRevelations(summary: string): string[] {
    const revelations: string[] = [];
    const lowerSummary = summary.toLowerCase();
    
    if (lowerSummary.includes('usuario') || lowerSummary.includes('user')) {
      // Extraer información básica del usuario mencionada
      if (lowerSummary.includes('gusta') || lowerSummary.includes('prefiere')) {
        revelations.push('Preferencias mencionadas');
      }
      if (lowerSummary.includes('experiencia') || lowerSummary.includes('experto')) {
        revelations.push('Experiencia discutida');
      }
    }
    
    return revelations;
  }

  /**
   * Extrae el tono predominante del resumen
   */
  private static extractDominantTone(summary: string): string {
    const lowerSummary = summary.toLowerCase();
    
    if (lowerSummary.includes('sexual') || lowerSummary.includes('erótico')) return 'sexual';
    if (lowerSummary.includes('dulce') || lowerSummary.includes('cariñoso')) return 'dulce';
    if (lowerSummary.includes('dominante') || lowerSummary.includes('dominación')) return 'dominante';
    if (lowerSummary.includes('sumiso') || lowerSummary.includes('sumisión')) return 'sumiso';
    if (lowerSummary.includes('emocional') || lowerSummary.includes('sentimental')) return 'emocional';
    
    return 'neutral';
  }

  /**
   * Extrae si el avatar ya se presentó
   */
  private static extractAvatarIntroduced(summary: string): boolean {
    const lowerSummary = summary.toLowerCase();
    return lowerSummary.includes('presentó') || lowerSummary.includes('presentado') || 
           lowerSummary.includes('nombre') || lowerSummary.includes('llamo');
  }

  /**
   * Extrae límites discutidos del resumen
   */
  private static extractBoundaries(summary: string): string[] {
    const boundaries: string[] = [];
    const lowerSummary = summary.toLowerCase();
    
    if (lowerSummary.includes('límite') || lowerSummary.includes('boundary')) {
      boundaries.push('Límites establecidos');
    }
    if (lowerSummary.includes('no') || lowerSummary.includes('rechaz')) {
      boundaries.push('Temas rechazados');
    }
    
    return boundaries;
  }

  /**
   * Extrae fantasías exploradas del resumen
   */
  private static extractFantasies(summary: string): string[] {
    const fantasies: string[] = [];
    const lowerSummary = summary.toLowerCase();
    
    if (lowerSummary.includes('fantasía') || lowerSummary.includes('fantasy')) {
      fantasies.push('Fantasías mencionadas');
    }
    if (lowerSummary.includes('roleplay') || lowerSummary.includes('rol')) {
      fantasies.push('Roleplay explorado');
    }
    
    return fantasies;
  }

  /**
   * Mapea los IDs de avatar a nombres de archivo
   */
  private static async mapAvatarIdToFileName(avatarId: string): Promise<string> {
    // Mapeo directo para nombres conocidos
    const avatarMap: { [key: string]: string } = {
      'avatar_1': 'luna',
      'avatar_2': 'sofia', 
      'avatar_3': 'aria',
      'avatar_4': 'venus',
      'avatar_luna': 'luna',
      'avatar_sofia': 'sofia',
      'avatar_aria': 'aria',
      'avatar_venus': 'venus',
      'avatar_maya': 'luna', // Fallback a luna para avatares no existentes
      'luna': 'luna',
      'sofia': 'sofia',
      'aria': 'aria',
      'venus': 'venus'
    };
    
    // Si es un mapeo directo conocido, usarlo
    if (avatarMap[avatarId]) {
      return avatarMap[avatarId];
    }
    
    // Si no es un mapeo directo, buscar en la base de datos
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      // Primero intentar buscar por ID exacto
      let avatar = await prisma.avatar.findUnique({
        where: { id: avatarId }
      });
      
      // Si no se encuentra, intentar buscar por nombre (por si el ID es un nombre)
      if (!avatar) {
        avatar = await prisma.avatar.findFirst({
          where: { 
            name: avatarId.charAt(0).toUpperCase() + avatarId.slice(1)
          }
        });
      }
      
      await prisma.$disconnect();
      
      if (avatar) {
        console.log(`[mapAvatarIdToFileName] Avatar encontrado: ${avatar.name} (ID: ${avatar.id})`);
        
        // Mapear el nombre del avatar al nombre del archivo
        const nameMap: { [key: string]: string } = {
          'Aria': 'aria',
          'Luna': 'luna',
          'Sofia': 'sofia',
          'Venus': 'venus'
        };
        
        const fileName = nameMap[avatar.name] || 'luna';
        console.log(`[mapAvatarIdToFileName] Mapeado ${avatar.name} -> ${fileName}.txt`);
        return fileName;
      } else {
        console.log(`[mapAvatarIdToFileName] No se encontró avatar con ID: ${avatarId}`);
      }
    } catch (error) {
      console.error(`[mapAvatarIdToFileName] Error buscando avatar en BD: ${avatarId}`, error);
    }
    
    console.log(`[mapAvatarIdToFileName] Usando fallback: luna.txt`);
    return 'luna'; // Fallback por defecto
  }

  /**
   * Construye el prompt del sistema basado en el avatar seleccionado
   * Lee el prompt desde archivos .txt en la carpeta prompts/avatars/
   */
  private static async buildSystemPrompt(avatarId?: string): Promise<string> {
    console.log(`[buildSystemPrompt] Iniciando con avatarId: ${avatarId}`);
    
    if (!avatarId) {
      console.log(`[buildSystemPrompt] No hay avatarId, devolviendo prompt por defecto`);
      return 'Por favor, selecciona un avatar para comenzar la conversación.';
    }

    try {
      console.log(`[buildSystemPrompt] Mapeando avatarId: ${avatarId}`);
      
      // Mapear el ID del avatar al nombre del archivo
      const fileName = await this.mapAvatarIdToFileName(avatarId);
      console.log(`[buildSystemPrompt] Nombre de archivo mapeado: ${fileName}`);
      
      const filePath = path.join(process.cwd(), 'src', 'prompts', 'avatars', `${fileName}.txt`);
      console.log(`[buildSystemPrompt] Ruta del archivo: ${filePath}`);
      
      // Verificar si el archivo existe
      try {
        await fs.access(filePath);
        console.log(`[buildSystemPrompt] Archivo existe: ${filePath}`);
      } catch (accessError) {
        console.error(`[buildSystemPrompt] Archivo no existe: ${filePath}`);
        return 'Por favor, selecciona un avatar válido para comenzar la conversación.';
      }
      
      // Leer el archivo de prompt
      const prompt = await fs.readFile(filePath, 'utf-8');
      console.log(`[buildSystemPrompt] Prompt leído desde archivo: ${fileName}.txt para avatarId: ${avatarId}`);
      console.log(`[buildSystemPrompt] Longitud del prompt: ${prompt.length} caracteres`);
      
      return prompt;
      
    } catch (error) {
      console.error(`[buildSystemPrompt] Error leyendo prompt para ${avatarId}:`, error);
      return 'Por favor, selecciona un avatar válido para comenzar la conversación.';
    }
  }

  /**
   * Valida y filtra contenido inapropiado
   */
  static async validateContent(content: string): Promise<{ isValid: boolean; reason?: string }> {
    // Moderación desactivada para permitir cualquier contenido legal
    return { isValid: true };
  }

  /**
   * Genera una descripción de avatar personalizada
   */
  static async generateAvatarDescription(
    name: string,
    personality: string,
    category: string
  ): Promise<string> {
    try {
      const prompt = `Genera una descripción atractiva y detallada para un avatar llamado "${name}" con personalidad: ${personality}. Categoría: ${category}.

La descripción debe ser:
- Atractiva y seductora
- Apropiada para adultos (18+)
- No extremadamente explícita
- Que refleje la personalidad del avatar
- Máximo 2-3 oraciones

Ejemplo de tono: Elegante, misteriosa, atractiva pero respetuosa.`;

      // Usar Venice para generar la descripción
      const messages = [
        { role: 'system', content: 'Eres un asistente experto en crear descripciones atractivas y seductoras para avatares de IA.' },
        { role: 'user', content: prompt }
      ];

      const response = await getVeniceResponse(messages);
      return response;
    } catch (error) {
      console.error('Error generando descripción de avatar:', error);
      return `${name} es un avatar atractivo con personalidad ${personality}.`;
    }
  }

  /**
   * Genera contenido para autocompletado de personajes
   */
  static async generateContent(prompt: string): Promise<string> {
    try {
      const messages = [
        { role: 'system', content: 'Eres un asistente experto en generar contenido creativo y atractivo.' },
        { role: 'user', content: prompt }
      ];

      const response = await getVeniceResponse(messages);
      return response;
    } catch (error) {
      console.error('Error generando contenido:', error);
      return 'No pude generar el contenido solicitado.';
    }
  }
} 