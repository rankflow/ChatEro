import fs from 'fs';
import path from 'path';
import { AvatarExtendedMemoryService } from './avatarExtendedMemory';

export interface SyncedAvatarData {
  // Datos básicos (del prompt fijo)
  id: string;
  name: string;
  description: string;
  personality: string;
  imageUrl: string;
  isPremium: boolean;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Datos extendidos (del JSON)
  age?: number;
  occupation?: string;
  origin?: string;
  background?: string;
  personalityTraits?: string;
  interests?: string;
  fears?: string;
  dreams?: string;
  secrets?: string;
  relationships?: string;
  lifeExperiences?: string;
  communicationStyle?: string;
  emotionalState?: string;
  motivations?: string;
  conflicts?: string;
  growth?: string;
  voiceType?: string;
  accent?: string;
  mannerisms?: string;
  style?: string;
  scent?: string;
  chatStyle?: string;
  topics?: string;
  boundaries?: string;
  kinks?: string;
  roleplay?: string;
  
  // Datos combinados
  fullPersonality: string;
  fullInterests: string;
  fullBackground: string;
}

export class AvatarSyncService {
  
  /**
   * Sincroniza todos los avatares disponibles
   */
  static async syncAllAvatars(): Promise<SyncedAvatarData[]> {
    try {
      const avatarsDir = path.join(process.cwd(), 'src', 'prompts', 'avatars');
      const extendedDir = path.join(avatarsDir, 'extended');
      
      // Obtener todos los archivos .txt (prompts fijos)
      const promptFiles = fs.readdirSync(avatarsDir)
        .filter(file => file.endsWith('.txt'))
        .map(file => file.replace('.txt', ''));
      
      const syncedAvatars: SyncedAvatarData[] = [];
      
      for (const avatarName of promptFiles) {
        const syncedData = await this.syncAvatar(avatarName);
        if (syncedData) {
          syncedAvatars.push(syncedData);
        }
      }
      
      console.log(`[AVATAR_SYNC] Sincronizados ${syncedAvatars.length} avatares`);
      return syncedAvatars;
      
    } catch (error) {
      console.error('[AVATAR_SYNC] Error sincronizando avatares:', error);
      return [];
    }
  }
  
  /**
   * Sincroniza un avatar específico
   */
  static async syncAvatar(avatarName: string): Promise<SyncedAvatarData | null> {
    try {
      console.log(`[AVATAR_SYNC] Sincronizando avatar: ${avatarName}`);
      
      // Cargar prompt fijo
      const promptData = this.loadPromptData(avatarName);
      if (!promptData) {
        console.log(`[AVATAR_SYNC] No se encontró prompt para: ${avatarName}`);
        return null;
      }
      
      // Cargar datos extendidos
      const extendedData = AvatarExtendedMemoryService.getAvatarFullData(`avatar_${avatarName}`);
      
      // Combinar datos
      const syncedData = this.combineData(avatarName, promptData, extendedData);
      
      // Guardar archivo sincronizado
      await this.saveSyncedData(avatarName, syncedData);
      
      console.log(`[AVATAR_SYNC] Avatar ${avatarName} sincronizado correctamente`);
      return syncedData;
      
    } catch (error) {
      console.error(`[AVATAR_SYNC] Error sincronizando avatar ${avatarName}:`, error);
      return null;
    }
  }
  
  /**
   * Carga los datos del prompt fijo
   */
  private static loadPromptData(avatarName: string): any {
    try {
      const promptPath = path.join(process.cwd(), 'src', 'prompts', 'avatars', `${avatarName}.txt`);
      
      if (!fs.existsSync(promptPath)) {
        return null;
      }
      
      const promptContent = fs.readFileSync(promptPath, 'utf-8');
      
      // Extraer información básica del prompt
      return this.parsePromptContent(promptContent, avatarName);
      
    } catch (error) {
      console.error(`[AVATAR_SYNC] Error cargando prompt para ${avatarName}:`, error);
      return null;
    }
  }
  
  /**
   * Parsea el contenido del prompt para extraer información básica
   */
  private static parsePromptContent(content: string, avatarName: string): any {
    const lines = content.split('\n');
    const data: any = {
      id: `avatar_${avatarName}`,
      name: avatarName.charAt(0).toUpperCase() + avatarName.slice(1), // Nombre por defecto
      description: 'Un avatar único y personalizado',
      personality: '', // Se generará basado en los datos reales
      imageUrl: `/api/avatars/avatar_${avatarName}/image`,
      isPremium: false,
      category: 'personalizado',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Extraer información específica del prompt
    for (const line of lines) {
      if (line.includes('Nombre:')) {
        const nameMatch = line.match(/Nombre:\s*(.+)/);
        if (nameMatch) {
          data.name = nameMatch[1].trim();
        }
      }
      if (line.includes('Edad:')) {
        const ageMatch = line.match(/Edad:\s*(\d+)/);
        if (ageMatch) {
          data.age = parseInt(ageMatch[1]);
        }
      }
      if (line.includes('Ocupación:')) {
        const occupationMatch = line.match(/Ocupación:\s*(.+)/);
        if (occupationMatch) {
          data.occupation = occupationMatch[1].trim();
        }
      }
      if (line.includes('Intereses:')) {
        const interestsMatch = line.match(/Intereses[^:]*:\s*(.+)/);
        if (interestsMatch) {
          data.interests = interestsMatch[1].trim();
        }
      }
      if (line.includes('Fetiches sexuales:')) {
        const kinksMatch = line.match(/Fetiches sexuales:\s*(.+)/);
        if (kinksMatch) {
          data.kinks = kinksMatch[1].trim();
        }
      }
    }
    
    // Generar descripción basada en la información extraída
    data.description = this.generateDescription(data);
    
    return data;
  }
  
  /**
   * Genera una descripción basada en los datos extraídos del prompt
   */
  private static generateDescription(data: any): string {
    const parts = [];
    
    if (data.name) {
      parts.push(`${data.name}`);
    }
    
    if (data.age) {
      parts.push(`de ${data.age} años`);
    }
    
    if (data.occupation) {
      parts.push(`que trabaja como ${data.occupation.toLowerCase()}`);
    }
    
    if (data.interests) {
      // Limpiar intereses (remover paréntesis y texto adicional)
      const cleanInterests = data.interests.replace(/\([^)]*\)/g, '').trim();
      if (cleanInterests) {
        parts.push(`interesada en ${cleanInterests.toLowerCase()}`);
      }
    }
    
    if (parts.length > 0) {
      return parts.join(', ') + '.';
    }
    
    return 'Un avatar único y personalizado.';
  }
  
  /**
   * Combina los datos del prompt con los datos extendidos
   */
  private static combineData(avatarName: string, promptData: any, extendedData: any): SyncedAvatarData {
    const syncedData: SyncedAvatarData = {
      // Datos básicos del prompt
      id: promptData.id,
      name: promptData.name,
      description: promptData.description,
      personality: extendedData?.personalityTraits || promptData.personality, // Usar personalidad real del JSON extendido
      imageUrl: promptData.imageUrl,
      isPremium: promptData.isPremium,
      category: promptData.category,
      isActive: promptData.isActive,
      createdAt: promptData.createdAt,
      updatedAt: promptData.updatedAt,
      
      // Datos extendidos (si existen)
      age: extendedData?.age || promptData.age,
      occupation: extendedData?.occupation || promptData.occupation,
      origin: extendedData?.origin,
      background: extendedData?.background,
      personalityTraits: extendedData?.personalityTraits,
      interests: extendedData?.interests || promptData.interests,
      fears: extendedData?.fears,
      dreams: extendedData?.dreams,
      secrets: extendedData?.secrets,
      relationships: extendedData?.relationships,
      lifeExperiences: extendedData?.lifeExperiences,
      communicationStyle: extendedData?.communicationStyle,
      emotionalState: extendedData?.emotionalState,
      motivations: extendedData?.motivations,
      conflicts: extendedData?.conflicts,
      growth: extendedData?.growth,
      voiceType: extendedData?.voiceType,
      accent: extendedData?.accent,
      mannerisms: extendedData?.mannerisms,
      style: extendedData?.style,
      scent: extendedData?.scent,
      chatStyle: extendedData?.chatStyle,
      topics: extendedData?.topics,
      boundaries: extendedData?.boundaries,
      kinks: extendedData?.kinks || promptData.kinks,
      roleplay: extendedData?.roleplay,
      
      // Datos combinados
      fullPersonality: extendedData?.personalityTraits || promptData.personality, // Solo usar personalidad real
      fullInterests: this.combineInterests(promptData.interests, extendedData?.interests),
      fullBackground: this.combineBackground(promptData.description, extendedData?.background)
    };
    
    return syncedData;
  }
  
  /**
   * Combina los intereses básicos con los extendidos
   */
  private static combineInterests(basicInterests?: string, extendedInterests?: string): string {
    if (!basicInterests && !extendedInterests) return '';
    if (!basicInterests) return extendedInterests!;
    if (!extendedInterests) return basicInterests;
    
    return `${basicInterests}. ${extendedInterests}`;
  }
  
  /**
   * Combina la descripción básica con el background extendido
   */
  private static combineBackground(basicDescription: string, extendedBackground?: string): string {
    if (!extendedBackground) return basicDescription;
    
    return `${basicDescription}. ${extendedBackground}`;
  }
  
  /**
   * Guarda los datos sincronizados en un archivo JSON
   */
  private static async saveSyncedData(avatarName: string, data: SyncedAvatarData): Promise<void> {
    try {
      const syncedDir = path.join(process.cwd(), 'src', 'prompts', 'avatars', 'synced');
      
      // Crear directorio si no existe
      if (!fs.existsSync(syncedDir)) {
        fs.mkdirSync(syncedDir, { recursive: true });
      }
      
      const filePath = path.join(syncedDir, `${avatarName}_synced.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      console.log(`[AVATAR_SYNC] Datos guardados en: ${filePath}`);
      
    } catch (error) {
      console.error(`[AVATAR_SYNC] Error guardando datos sincronizados:`, error);
    }
  }
  
  /**
   * Obtiene los datos sincronizados de un avatar
   */
  static getSyncedAvatarData(avatarName: string): SyncedAvatarData | null {
    try {
      const syncedDir = path.join(process.cwd(), 'src', 'prompts', 'avatars', 'synced');
      const filePath = path.join(syncedDir, `${avatarName}_synced.json`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
      
    } catch (error) {
      console.error(`[AVATAR_SYNC] Error cargando datos sincronizados:`, error);
      return null;
    }
  }
} 