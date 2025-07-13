import { Avatar } from '../types/index.js';
import { CharacterDevelopmentService } from './characterDevelopment';
import { getVeniceResponse } from './veniceAI.js';
import { promises as fs } from 'fs';
import path from 'path';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatContext {
  avatar?: Avatar;
  conversationHistory: ChatMessage[];
  userPreferences?: string;
}

export class AIService {
  /**
   * Genera una respuesta del chat usando Venice Uncensored
   */
  static async generateChatResponse(
    userMessage: string,
    context: ChatContext
  ): Promise<{ message: string; tokensUsed: number }> {
    try {

      
      // Construir el prompt del sistema basado en el avatar
      const systemPrompt = await this.buildSystemPrompt(context.avatar?.id);
      
      // Preparar el historial de conversación
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...context.conversationHistory.slice(-10), // Últimos 10 mensajes
        { role: 'user', content: userMessage }
      ];

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
   * Construye el prompt del sistema basado en el avatar seleccionado
   * Nuevo diseño: 2 niveles funcionales (base global + prompt ligero por avatar)
   */
  private static async buildSystemPrompt(avatarId?: string): Promise<string> {
    const basePath = path.resolve(__dirname, '../prompts/promptBase.txt');
    const basePrompt = await fs.readFile(basePath, 'utf-8');

    if (!avatarId) return basePrompt;

    const avatarPath = path.resolve(__dirname, `../prompts/avatars/${avatarId}.txt`);
    try {
      const avatarPrompt = await fs.readFile(avatarPath, 'utf-8');
      return `${basePrompt.trim()}\n\n${avatarPrompt.trim()}`;
    } catch (err) {
      console.warn(`[buildSystemPrompt] Avatar prompt not found for: ${avatarId}`);
      return basePrompt;
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