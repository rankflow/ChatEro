import OpenAI from 'openai';
import { Avatar } from '../types/index.js';

// Inicializar cliente de OpenAI de forma lazy
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatContext {
  avatar?: Avatar;
  conversationHistory: ChatMessage[];
  userPreferences?: string;
}

export class OpenAIService {
  /**
   * Genera una respuesta del chat basada en el avatar seleccionado
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

      // Llamar a la API de OpenAI
      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o',
        messages: messages as any,
        max_tokens: 500,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const response = completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        message: response,
        tokensUsed
      };
    } catch (error) {
      console.error('Error en OpenAI API:', error);
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

      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || `${name} es un avatar atractivo con personalidad ${personality}.`;
    } catch (error) {
      console.error('Error generando descripción de avatar:', error);
      return `${name} es un avatar atractivo con personalidad ${personality}.`;
    }
  }
} 