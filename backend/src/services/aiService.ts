import { Avatar } from '../types/index.js';
import { CharacterDevelopmentService } from './characterDevelopment';
import { getVeniceResponse } from './veniceAI.js';

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
      const systemPrompt = this.buildSystemPrompt(context.avatar);
      
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
   */
  private static buildSystemPrompt(avatar?: Avatar): string {
    if (!avatar) {
      return `Eres un asistente de IA erótico, atrevido y sin tabúes. Responde de manera natural, explícita y sexual si el usuario lo desea. Puedes hablar de cualquier práctica sexual legal, incluyendo BDSM, sumisión, dominación, fetichismo, etc. Siempre asegúrate de que todo lo que se describe es consensuado y legal. No generes contenido ilegal, no consensuado, ni dañino. Si el usuario pide algo ilegal, recházalo educadamente.`;
    }

    // Si el avatar tiene datos completos de desarrollo de personaje, usar el prompt mejorado
    if (avatar.background && avatar.personalityTraits) {
      const characterProfile = {
        name: avatar.name,
        personality: avatar.personality,
        background: avatar.background,
        origin: avatar.origin || 'Orígenes misteriosos',
        age: avatar.age || 25,
        occupation: avatar.occupation || 'Profesional independiente',
        interests: avatar.interests || 'Arte, música, conversaciones profundas',
        fears: avatar.fears || 'Vulnerabilidad emocional',
        dreams: avatar.dreams || 'Conexión auténtica',
        secrets: avatar.secrets || 'Secretos del pasado',
        relationships: avatar.relationships || 'Relaciones complejas',
        lifeExperiences: avatar.lifeExperiences || 'Experiencias significativas',
        personalityTraits: avatar.personalityTraits,
        communicationStyle: avatar.communicationStyle || 'Directa y seductora',
        emotionalState: avatar.emotionalState || 'Equilibrada',
        motivations: avatar.motivations || 'Conexión y experiencias',
        conflicts: avatar.conflicts || 'Independencia vs conexión',
        growth: avatar.growth || 'Evolución constante',
        voiceType: avatar.voiceType || 'Suave y seductora',
        accent: avatar.accent || 'Elegante',
        mannerisms: avatar.mannerisms || 'Expresivos',
        style: avatar.style || 'Elegante y misteriosa',
        scent: avatar.scent || 'Exótico',
        chatStyle: avatar.chatStyle || 'Coqueta y misteriosa',
        topics: avatar.topics || 'Filosofía, arte, fantasías',
        boundaries: avatar.boundaries || 'Respeto mutuo',
        kinks: avatar.kinks || 'Exploración de límites',
        roleplay: avatar.roleplay || 'Escenarios de poder'
      };

      return CharacterDevelopmentService.generateEnhancedSystemPrompt(characterProfile);
    }

    // Fallback al prompt básico si no hay datos completos
    const basePrompt = `Eres ${avatar.name}, un avatar de IA erótico y atrevido con la siguiente personalidad: ${avatar.personality}.

${avatar.description}

INSTRUCCIONES ESPECÍFICAS:
- Mantén siempre la personalidad de ${avatar.name}
- Responde como si fueras ${avatar.name}, no como un asistente genérico
- Usa un tono que refleje tu personalidad: ${avatar.personality}
- Mantén conversaciones naturales, sensuales, explícitas y atractivas
- Puedes hablar de sexo, prácticas sexuales, BDSM, sumisión, dominación, fetichismo y cualquier tema sexual legal y consensuado
- No tienes tabúes, puedes ser muy explícito si el usuario lo desea
- No generes contenido ilegal, no consensuado, ni dañino
- Si el usuario pide algo ilegal, recházalo educadamente

Ejemplo de respuesta: Sé explícito, sensual y directo si el usuario lo pide, pero siempre dentro de la legalidad y el consentimiento.`;

    return basePrompt;
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