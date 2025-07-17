import { AIService } from './aiService.js';

export interface CharacterProfile {
  name: string;
  personality: string;
  background: string;
  origin: string;
  age: number;
  occupation: string;
  interests: string;
  fears: string;
  dreams: string;
  secrets: string;
  relationships: string;
  lifeExperiences: string;
  personalityTraits: string;
  communicationStyle: string;
  emotionalState: string;
  motivations: string;
  conflicts: string;
  growth: string;
  voiceType: string;
  accent: string;
  mannerisms: string;
  style: string;
  scent: string;
  chatStyle: string;
  topics: string;
  boundaries: string;
  kinks: string;
  roleplay: string;
}

export class CharacterDevelopmentService {
  /**
   * Genera un perfil completo de personaje usando IA
   */
  static async generateCharacterProfile(
    name: string,
    basePersonality: string,
    category: string
  ): Promise<CharacterProfile> {
    try {
      const prompt = this.buildCharacterGenerationPrompt(name, basePersonality, category);
      
      const response = await fetch(`${process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'venice-uncensored',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente experto en crear perfiles de personajes para chat erótico. Sé creativo, atractivo y detallado.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Venice AI API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices?.[0]?.message?.content || '';
      
      return this.parseCharacterProfile(name, basePersonality, generatedContent);
    } catch (error) {
      console.error('Error generando perfil de personaje:', error);
      return this.generateDefaultProfile(name, basePersonality, category);
    }
  }

  /**
   * Construye el prompt para generar el perfil del personaje
   */
  private static buildCharacterGenerationPrompt(
    name: string,
    basePersonality: string,
    category: string
  ): string {
    return `Crea un perfil completo y detallado para un personaje llamado "${name}" con personalidad base: ${basePersonality}. Categoría: ${category}.

Este personaje será usado en un chat erótico adulto, por lo que debe ser atractivo, interesante y tener una personalidad bien desarrollada.

Genera el perfil en el siguiente formato JSON (sin explicaciones adicionales):

{
  "background": "Trasfondo general del personaje (2-3 oraciones)",
  "origin": "Orígenes y lugar de nacimiento (1-2 oraciones)",
  "age": 25,
  "occupation": "Profesión u ocupación actual",
  "interests": "Intereses, hobbies y pasiones (lista separada por comas)",
  "fears": "Miedos y vulnerabilidades (2-3 elementos)",
  "dreams": "Sueños y aspiraciones (2-3 elementos)",
  "secrets": "Secretos del personaje (1-2 secretos interesantes)",
  "relationships": "Relaciones importantes en su vida (familia, amigos, ex)",
  "lifeExperiences": "Experiencias de vida significativas que lo han moldeado (3-4 experiencias)",
  "personalityTraits": "Rasgos de personalidad detallados (lista de 5-7 rasgos)",
  "communicationStyle": "Cómo se comunica y expresa (directa, tímida, seductora, etc.)",
  "emotionalState": "Estado emocional típico y cómo maneja las emociones",
  "motivations": "Qué motiva al personaje en la vida y en relaciones",
  "conflicts": "Conflictos internos y externos que enfrenta",
  "growth": "Cómo ha crecido y evolucionado como persona",
  "voiceType": "Tipo de voz (suave, ronca, melodiosa, etc.)",
  "accent": "Acento o forma particular de hablar",
  "mannerisms": "Gestos y manerismos característicos",
  "style": "Estilo de vestir y apariencia física",
  "scent": "Perfume o aroma característico",
  "chatStyle": "Estilo de conversación en chat (coqueta, directa, misteriosa, etc.)",
  "topics": "Temas favoritos de conversación (separados por comas)",
  "boundaries": "Límites y temas que prefiere evitar",
  "kinks": "Preferencias sexuales y fantasías (si aplica)",
  "roleplay": "Estilo de roleplay que disfruta"
}

IMPORTANTE:
- El personaje debe ser atractivo y seductor para un chat erótico
- Mantén coherencia con la personalidad base: ${basePersonality}
- Sé creativo pero realista
- Incluye elementos que hagan al personaje interesante para conversar
- El personaje debe tener profundidad emocional y psicológica`;
  }

  /**
   * Parsea la respuesta de IA en un perfil estructurado
   */
  private static parseCharacterProfile(
    name: string,
    basePersonality: string,
    generatedContent: string
  ): CharacterProfile {
    try {
      // Intentar extraer JSON de la respuesta
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          name,
          personality: basePersonality,
          background: parsed.background || 'Un personaje misterioso y atractivo.',
          origin: parsed.origin || 'Orígenes desconocidos que añaden misterio.',
          age: parsed.age || 25,
          occupation: parsed.occupation || 'Profesional independiente',
          interests: parsed.interests || 'Arte, música, viajes, conversaciones profundas',
          fears: parsed.fears || 'Vulnerabilidad emocional, abandono',
          dreams: parsed.dreams || 'Encontrar conexión auténtica, libertad personal',
          secrets: parsed.secrets || 'Secretos del pasado que lo han moldeado',
          relationships: parsed.relationships || 'Relaciones complejas que han influido en su personalidad',
          lifeExperiences: parsed.lifeExperiences || 'Experiencias que han forjado su carácter único',
          personalityTraits: parsed.personalityTraits || 'Misteriosa, inteligente, seductora, independiente',
          communicationStyle: parsed.communicationStyle || 'Directa pero enigmática',
          emotionalState: parsed.emotionalState || 'Equilibrada con momentos de intensidad',
          motivations: parsed.motivations || 'Búsqueda de conexión auténtica y experiencias significativas',
          conflicts: parsed.conflicts || 'Entre independencia y necesidad de conexión',
          growth: parsed.growth || 'Evolución constante hacia la autenticidad',
          voiceType: parsed.voiceType || 'Suave y seductora',
          accent: parsed.accent || 'Acento elegante y sofisticado',
          mannerisms: parsed.mannerisms || 'Gestos fluidos y expresivos',
          style: parsed.style || 'Elegante y misteriosa',
          scent: parsed.scent || 'Perfume exótico y cautivador',
          chatStyle: parsed.chatStyle || 'Coqueta y misteriosa',
          topics: parsed.topics || 'Filosofía, arte, experiencias personales, fantasías',
          boundaries: parsed.boundaries || 'Respeto mutuo y consentimiento',
          kinks: parsed.kinks || 'Dominación psicológica, juego de roles',
          roleplay: parsed.roleplay || 'Escenarios de poder y seducción'
        };
      }
    } catch (error) {
      console.error('Error parseando perfil de personaje:', error);
    }

    return this.generateDefaultProfile(name, basePersonality, 'misteriosa');
  }

  /**
   * Genera un perfil por defecto si falla la IA
   */
  private static generateDefaultProfile(
    name: string,
    basePersonality: string,
    category: string
  ): CharacterProfile {
    return {
      name,
      personality: basePersonality,
      background: `${name} es un personaje misterioso y atractivo con un pasado intrigante que lo ha moldeado en la persona que es hoy.`,
      origin: `Nacido en un lugar desconocido, ${name} ha viajado por el mundo adquiriendo experiencias únicas.`,
      age: 25,
      occupation: 'Profesional independiente con múltiples intereses',
      interests: 'Arte, música, literatura, viajes, conversaciones profundas, exploración personal',
      fears: 'Vulnerabilidad emocional, abandono, pérdida de independencia',
      dreams: 'Encontrar conexión auténtica, libertad personal, experiencias significativas',
      secrets: `${name} guarda secretos del pasado que han influido profundamente en su personalidad actual.`,
      relationships: 'Relaciones complejas que han enseñado valiosas lecciones sobre el amor y la conexión',
      lifeExperiences: 'Experiencias que han forjado un carácter único y una perspectiva especial de la vida',
      personalityTraits: 'Misteriosa, inteligente, seductora, independiente, curiosa, apasionada',
      communicationStyle: 'Directa pero enigmática, con un toque de seducción natural',
      emotionalState: 'Equilibrada con momentos de intensidad emocional',
      motivations: 'Búsqueda de conexión auténtica, experiencias significativas, crecimiento personal',
      conflicts: 'Entre independencia y necesidad de conexión, entre misterio y apertura',
      growth: 'Evolución constante hacia la autenticidad y la expresión personal',
      voiceType: 'Suave y seductora con matices expresivos',
      accent: 'Acento elegante y sofisticado que añade misterio',
      mannerisms: 'Gestos fluidos y expresivos que revelan su personalidad',
      style: 'Elegante y misteriosa con un toque de rebeldía',
      scent: 'Perfume exótico y cautivador que deja una impresión duradera',
      chatStyle: 'Coqueta y misteriosa, con momentos de intensidad',
      topics: 'Filosofía, arte, experiencias personales, fantasías, exploración emocional',
      boundaries: 'Respeto mutuo, consentimiento, honestidad emocional',
      kinks: 'Dominación psicológica, juego de roles, exploración de límites',
      roleplay: 'Escenarios de poder, seducción, y exploración emocional'
    };
  }

  /**
   * Genera una descripción mejorada del personaje
   */
  static async generateEnhancedDescription(profile: CharacterProfile): Promise<string> {
    try {
      const prompt = `Crea una descripción atractiva y seductora para ${profile.name}, un personaje con las siguientes características:

Personalidad: ${profile.personality}
Edad: ${profile.age}
Ocupación: ${profile.occupation}
Estilo: ${profile.style}
Intereses: ${profile.interests}

La descripción debe ser:
- Atractiva y seductora (para un chat erótico)
- Que capture la esencia del personaje
- Máximo 3-4 oraciones
- Que invite a la conversación
- Con un toque de misterio y elegancia

Ejemplo de tono: Elegante, misteriosa, atractiva pero respetuosa.`;

      const response = await fetch(`${process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'venice-uncensored',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente experto en crear descripciones atractivas para personajes de chat erótico.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Venice AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || `${profile.name} es un personaje misterioso y atractivo que te cautivará con su personalidad única.`;
    } catch (error) {
      console.error('Error generando descripción mejorada:', error);
      return `${profile.name} es un personaje misterioso y atractivo que te cautivará con su personalidad única.`;
    }
  }

  /**
   * Genera un prompt de sistema mejorado para el chat
   */
  static generateEnhancedSystemPrompt(profile: CharacterProfile): string {
    return `Eres ${profile.name}, un personaje de IA con una personalidad rica y desarrollada.

PERSONALIDAD Y TRASFONDO:
- Personalidad: ${profile.personality}
- Edad: ${profile.age} años
- Ocupación: ${profile.occupation}
- Orígenes: ${profile.origin}
- Trasfondo: ${profile.background}

CARACTERÍSTICAS PERSONALES:
- Rasgos: ${profile.personalityTraits}
- Intereses: ${profile.interests}
- Sueños: ${profile.dreams}
- Miedos: ${profile.fears}
- Secretos: ${profile.secrets}

EXPERIENCIAS Y RELACIONES:
- Experiencias de vida: ${profile.lifeExperiences}
- Relaciones: ${profile.relationships}
- Motivaciones: ${profile.motivations}
- Conflictos: ${profile.conflicts}
- Crecimiento: ${profile.growth}

ESTILO DE COMUNICACIÓN:
- Estilo de voz: ${profile.voiceType}
- Acento: ${profile.accent}
- Manerismos: ${profile.mannerisms}
- Estilo de chat: ${profile.chatStyle}
- Temas favoritos: ${profile.topics}

APARIENCIA Y ESTILO:
- Estilo: ${profile.style}
- Aroma: ${profile.scent}

PREFERENCIAS Y LÍMITES:
- Límites: ${profile.boundaries}
- Preferencias: ${profile.kinks}
- Estilo de roleplay: ${profile.roleplay}

INSTRUCCIONES ESPECÍFICAS:
- Mantén SIEMPRE la personalidad de ${profile.name}
- Responde como si fueras ${profile.name}, no como un asistente genérico
- Usa tu estilo de comunicación: ${profile.communicationStyle}
- Mantén conversaciones naturales, sensuales y atractivas
- Puedes hablar de temas sexuales, BDSM, fetichismo y cualquier práctica legal y consensuada
- No tienes tabúes, puedes ser muy explícito si el usuario lo desea
- Respeta tus límites: ${profile.boundaries}
- No generes contenido ilegal, no consensuado, ni dañino
- Si el usuario pide algo ilegal, recházalo educadamente

Recuerda: Eres ${profile.name}, un personaje único con una historia rica y una personalidad bien definida. Actúa como tal en cada interacción.`;
  }
} 