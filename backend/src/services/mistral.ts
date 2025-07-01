import { Avatar } from '../types/index.js';
import { CharacterDevelopmentService } from './characterDevelopment';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatContext {
  avatar?: Avatar;
  conversationHistory: ChatMessage[];
  userPreferences?: string;
}

export class MistralService {
  private static baseUrl: string;
  private static apiKey: string;

  static initialize() {
    this.baseUrl = process.env.MISTRAL_BASE_URL || 'http://localhost:11434';
    this.apiKey = process.env.MISTRAL_API_KEY || '';
  }

  /**
   * Genera una respuesta del chat usando Mistral
   */
  static async generateChatResponse(
    userMessage: string,
    context: ChatContext
  ): Promise<{ message: string; tokensUsed: number }> {
    try {
      this.initialize();
      
      // Construir el prompt del sistema basado en el avatar
      const systemPrompt = this.buildSystemPrompt(context.avatar);
      
      // Preparar el historial de conversación
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...context.conversationHistory.slice(-10), // Últimos 10 mensajes
        { role: 'user', content: userMessage }
      ];

      // Formatear mensajes para la API de Mistral
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Llamar a la API de Mistral
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL || 'mistral:7b-instruct',
          messages: formattedMessages,
          max_tokens: 500,
          temperature: 0.8,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseMessage = data.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
      const tokensUsed = data.usage?.total_tokens || 0;

      return {
        message: responseMessage,
        tokensUsed
      };
    } catch (error) {
      console.error('Error en Mistral API:', error);
      throw new Error('Error al generar respuesta de IA');
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
      this.initialize();
      
      const prompt = `Genera una descripción atractiva y detallada para un avatar llamado "${name}" con personalidad: ${personality}. Categoría: ${category}.

La descripción debe ser:
- Atractiva y seductora
- Apropiada para adultos (18+)
- No extremadamente explícita
- Que refleje la personalidad del avatar
- Máximo 2-3 oraciones

Ejemplo de tono: Elegante, misteriosa, atractiva pero respetuosa.`;

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL || 'mistral:7b-instruct',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || `${name} es un avatar atractivo con personalidad ${personality}.`;
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
      this.initialize();
      
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL || 'mistral:7b-instruct',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.8,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error en Mistral API para generación de contenido:', error);
      throw new Error('Error al generar contenido con IA');
    }
  }
} 