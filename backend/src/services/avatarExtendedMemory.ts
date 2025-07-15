import fs from 'fs';
import path from 'path';

export interface AvatarExtendedData {
  name: string;
  age: number;
  occupation: string;
  origin: string;
  background: string;
  personalityTraits: string;
  interests: string;
  fears: string;
  dreams: string;
  secrets: string;
  relationships: string;
  lifeExperiences: string;
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

// Mapeo de intenciones a campos del JSON
const fieldMap: Record<string, keyof AvatarExtendedData> = {
  // Perfume y aroma
  'perfume': 'scent',
  'aroma': 'scent',
  'hueles': 'scent',
  'olor': 'scent',
  'huele': 'scent',
  
  // Música
  'música': 'topics',
  'canción': 'topics',
  'música favorita': 'topics',
  'gusta escuchar': 'topics',
  
  // Hobbies e intereses
  'hobbies': 'interests',
  'aficiones': 'interests',
  'intereses': 'interests',
  'gusta hacer': 'interests',
  'pasatiempos': 'interests',
  
  // Secretos
  'secreto': 'secrets',
  'secretos': 'secrets',
  'oculto': 'secrets',
  
  // Voz
  'voz': 'voiceType',
  'hablas voz': 'voiceType',
  'sonas voz': 'voiceType',
  
  // Edad
  'edad': 'age',
  'años': 'age',
  'cuántos años': 'age',
  'cuantos años': 'age',
  'tienes edad': 'age',
  'cuál es tu edad': 'age',
  'cual es tu edad': 'age',
  
  // Origen
  'origen': 'origin',
  'de dónde': 'origin',
  'de donde': 'origin',
  'naciste': 'origin',
  'vienes': 'origin',
  'dónde naciste': 'origin',
  'donde naciste': 'origin',
  'de dónde eres': 'origin',
  'de donde eres': 'origin',
  
  // Ocupación
  'trabajo': 'occupation',
  'trabajas': 'occupation',
  'profesión': 'occupation',
  'profesion': 'occupation',
  'ocupación': 'occupation',
  'ocupacion': 'occupation',
  'a qué te dedicas': 'occupation',
  'a que te dedicas': 'occupation',
  'qué haces': 'occupation',
  'que haces': 'occupation',
  
  // Personalidad
  'personalidad': 'personalityTraits',
  'eres personalidad': 'personalityTraits',
  'carácter': 'personalityTraits',
  
  // Miedos
  'miedos': 'fears',
  'miedo': 'fears',
  'temes': 'fears',
  
  // Sueños
  'sueños': 'dreams',
  'sueño': 'dreams',
  'aspiras': 'dreams',
  'quieres sueños': 'dreams',
  
  // Relaciones
  'relaciones': 'relationships',
  'pareja': 'relationships',
  'casada': 'relationships',
  'soltera': 'relationships',
  'novio': 'relationships',
  'novia': 'relationships',
  'esposo': 'relationships',
  'esposa': 'relationships',
  'marido': 'relationships',
  'mujer': 'relationships',
  'tienes novio': 'relationships',
  'tienes novia': 'relationships',
  'estás soltera': 'relationships',
  'estás casada': 'relationships',
  
  // Experiencias
  'experiencias': 'lifeExperiences',
  'vivido': 'lifeExperiences',
  'pasado': 'lifeExperiences',
  
  // Comunicación
  'hablas comunicación': 'communicationStyle',
  'comunicación': 'communicationStyle',
  'expresas': 'communicationStyle',
  
  // Estado emocional
  'sientes': 'emotionalState',
  'emoción': 'emotionalState',
  'estado': 'emotionalState',
  
  // Motivaciones
  'motivaciones': 'motivations',
  'motiva': 'motivations',
  'quieres motivaciones': 'motivations',
  
  // Conflictos
  'conflictos': 'conflicts',
  'problema': 'conflicts',
  'lucha': 'conflicts',
  
  // Crecimiento
  'crecimiento': 'growth',
  'aprendido': 'growth',
  'cambiado': 'growth',
  
  // Acento
  'acento': 'accent',
  'hablas acento': 'accent',
  'sonas acento': 'accent',
  
  // Manerismos
  'manerismos': 'mannerisms',
  'gestos': 'mannerisms',
  'movimientos': 'mannerisms',
  
  // Estilo
  'estilo': 'style',
  'vistes': 'style',
  'ropa': 'style',
  'apariencia': 'style',
  
  // Chat
  'chateas': 'chatStyle',
  'conversación': 'chatStyle',
  'hablas chat': 'chatStyle',
  
  // Temas
  'temas': 'topics',
  'conversar': 'topics',
  'hablar temas': 'topics',
  
  // Límites
  'límites': 'boundaries',
  'no te gusta': 'boundaries',
  'evitas': 'boundaries',
  
  // Kinks
  'kinks': 'kinks',
  'gustos': 'kinks',
  'preferencias': 'kinks',
  'fetiches': 'kinks',
  
  // Roleplay
  'roleplay': 'roleplay',
  'juegos': 'roleplay',
  'fantasías': 'roleplay'
};

// Cache para mejorar rendimiento
const avatarCache = new Map<string, AvatarExtendedData>();

export class AvatarExtendedMemoryService {
  
  /**
   * Obtiene un detalle específico del avatar basado en la intención del usuario
   */
  static getAvatarDetail(avatarId: string, userIntent: string): string | null {
    try {
      // Normalizar el avatarId y extraer el nombre del avatar
      const normalizedAvatarId = avatarId.toLowerCase();
      // Extraer el nombre del avatar (ej: "avatar_aria" -> "aria")
      const avatarName = normalizedAvatarId.replace('avatar_', '');
      
      console.log(`[AVATAR_MEMORY] AvatarId original: ${avatarId}`);
      console.log(`[AVATAR_MEMORY] AvatarId normalizado: ${normalizedAvatarId}`);
      console.log(`[AVATAR_MEMORY] Nombre extraído: ${avatarName}`);
      
      // Cargar datos del avatar (usando cache si está disponible)
      const avatarData = this.loadAvatarData(avatarName);
      if (!avatarData) {
        console.log(`[AVATAR_MEMORY] No se encontraron datos para avatar: ${avatarId}`);
        return null;
      }
      
      // Buscar la intención en el mapeo
      const normalizedIntent = userIntent.toLowerCase().trim();
      const field = this.findMatchingField(normalizedIntent);
      
      if (!field) {
        console.log(`[AVATAR_MEMORY] No se encontró mapeo para intención: "${userIntent}"`);
        return null;
      }
      
      const value = avatarData[field];
      if (!value) {
        console.log(`[AVATAR_MEMORY] Campo "${field}" no encontrado para avatar: ${avatarId}`);
        return null;
      }
      
      console.log(`[AVATAR_MEMORY] Encontrado "${field}" para ${avatarId}: ${value}`);
      return String(value);
      
    } catch (error) {
      console.error(`[AVATAR_MEMORY] Error obteniendo detalle del avatar:`, error);
      return null;
    }
  }
  
  /**
   * Carga los datos del avatar desde el archivo JSON
   */
  private static loadAvatarData(avatarId: string): AvatarExtendedData | null {
    // Verificar cache primero
    if (avatarCache.has(avatarId)) {
      return avatarCache.get(avatarId)!;
    }
    
    try {
      const filePath = path.join(process.cwd(), 'src', 'prompts', 'avatars', 'extended', `${avatarId}_extended.json`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`[AVATAR_MEMORY] Archivo no encontrado: ${filePath}`);
        return null;
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const avatarData: AvatarExtendedData = JSON.parse(fileContent);
      
      // Guardar en cache
      avatarCache.set(avatarId, avatarData);
      
      console.log(`[AVATAR_MEMORY] Datos cargados para avatar: ${avatarId}`);
      return avatarData;
      
    } catch (error) {
      console.error(`[AVATAR_MEMORY] Error cargando datos del avatar ${avatarId}:`, error);
      return null;
    }
  }
  
  /**
   * Encuentra el campo que coincide con la intención del usuario
   */
  private static findMatchingField(userIntent: string): keyof AvatarExtendedData | null {
    const normalizedIntent = userIntent.toLowerCase().trim();
    
    // Lista de palabras que indican preguntas directas
    const questionWords = ['qué', 'que', 'cuál', 'cual', 'cuántos', 'cuantos', 'tienes', 'tienes', 'eres', 'estás', 'estas', 'dónde', 'donde', 'cómo', 'como'];
    
    // Buscar coincidencias exactas primero
    for (const [intent, field] of Object.entries(fieldMap)) {
      if (normalizedIntent.includes(intent)) {
        // Verificar que no sea una coincidencia accidental
        // Si la intención contiene palabras de pregunta, es más probable que sea una pregunta real
        const hasQuestionWord = questionWords.some(word => normalizedIntent.includes(word));
        
        // Si no tiene palabra de pregunta, verificar que la coincidencia sea más específica
        if (hasQuestionWord || this.isSpecificMatch(normalizedIntent, intent)) {
          return field;
        }
      }
    }
    
    // Buscar coincidencias parciales solo si la intención tiene al menos 3 caracteres
    // para evitar falsos positivos con palabras cortas como "si", "no", etc.
    if (normalizedIntent.length >= 3) {
      for (const [intent, field] of Object.entries(fieldMap)) {
        // Solo considerar coincidencias si la intención del usuario es al menos 50% del mapeo
        // o si el mapeo está contenido en la intención del usuario
        if (intent.includes(normalizedIntent) && normalizedIntent.length >= intent.length * 0.5) {
          return field;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Verifica si la coincidencia es específica y no accidental
   */
  private static isSpecificMatch(userIntent: string, mappedIntent: string): boolean {
    // Si la intención del usuario es exactamente igual al mapeo, es específica
    if (userIntent === mappedIntent) {
      return true;
    }
    
    // Si la intención del usuario termina con el mapeo, es más probable que sea específica
    if (userIntent.endsWith(mappedIntent)) {
      return true;
    }
    
    // Si la intención del usuario comienza con el mapeo, es más probable que sea específica
    if (userIntent.startsWith(mappedIntent)) {
      return true;
    }
    
    // Si el mapeo está rodeado de espacios o puntuación, es más específico
    const regex = new RegExp(`\\b${mappedIntent}\\b`, 'i');
    if (regex.test(userIntent)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Limpia el cache (útil para testing o actualizaciones)
   */
  static clearCache(): void {
    avatarCache.clear();
    console.log('[AVATAR_MEMORY] Cache limpiado');
  }
  
  /**
   * Obtiene todos los datos del avatar (útil para debugging)
   */
  static getAvatarFullData(avatarId: string): AvatarExtendedData | null {
    const normalizedAvatarId = avatarId.toLowerCase();
    const avatarName = normalizedAvatarId.replace('avatar_', '');
    return this.loadAvatarData(avatarName);
  }
} 