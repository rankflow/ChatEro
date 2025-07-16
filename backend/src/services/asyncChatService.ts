import { Avatar } from '../types/index.js';

export interface AsyncChatContext {
  userTyping: boolean;
  messageCount: number;
  userTypingSpeed: number; // mensajes por minuto
  timeSinceLastMessage: number; // milisegundos
  conversationTone: 'normal' | 'urgent' | 'emotional' | 'intense';
  avatarPersonality: string;
  pendingMessages: string[];
  conversationHistory: any[];
}

export interface AsyncDecision {
  shouldRespond: boolean;
  delay: number;
  strategy: string;
  reason: string;
  crossedWithUser?: boolean;
}

export class AsyncChatService {
  /**
   * Evalúa si debe responder mientras el usuario está escribiendo
   */
  static decideResponseStrategy(context: AsyncChatContext): AsyncDecision {
    const {
      userTyping,
      messageCount,
      userTypingSpeed,
      timeSinceLastMessage,
      conversationTone,
      avatarPersonality,
      pendingMessages
    } = context;

    // Analizar personalidad del avatar para determinar comportamiento
    const avatarBehavior = this.analyzeAvatarBehavior(avatarPersonality);

    // Matriz de decisión por prioridad (MEJORADA)
    const decisionMatrix = [
      // 1. Primer mensaje - responder inmediatamente
      {
        condition: messageCount === 1 && !userTyping,
        action: 'respond_first_message',
        delay: 300,
        reason: 'Primer mensaje del usuario',
        shouldRespond: true
      },
      
      // 2. Usuario escribiendo + múltiples mensajes acumulados (umbral reducido)
      {
        condition: userTyping && messageCount >= 2,
        action: 'respond_to_accumulated',
        delay: 800,
        reason: 'Múltiples mensajes esperando respuesta',
        shouldRespond: true
      },
      
      // 3. Usuario escribiendo + mensaje largo
      {
        condition: userTyping && pendingMessages.some(msg => msg.length > 100),
        action: 'respond_to_long_message',
        delay: 1000,
        reason: 'Mensaje largo requiere respuesta',
        shouldRespond: true
      },
      
      // 4. Usuario escribiendo + tono urgente
      {
        condition: userTyping && conversationTone === 'urgent',
        action: 'respond_immediately',
        delay: 300,
        reason: 'Tono urgente requiere respuesta inmediata',
        shouldRespond: true
      },
      
      // 5. Usuario escribiendo + avatar dominante/assertivo
      {
        condition: userTyping && avatarBehavior.isDominant,
        action: 'respond_assertively',
        delay: avatarBehavior.responseDelay,
        reason: `Avatar ${avatarBehavior.type} toma control`,
        shouldRespond: true
      },
      
      // 6. Usuario escribiendo + pausa natural (umbral reducido)
      {
        condition: userTyping && timeSinceLastMessage > 2000,
        action: 'respond_after_pause',
        delay: 600,
        reason: 'Pausa natural detectada',
        shouldRespond: true
      },
      
      // 7. Usuario escribiendo + velocidad muy alta (umbral aumentado)
      {
        condition: userTyping && userTypingSpeed > 12, // más de 12 mensajes por minuto
        action: 'wait_for_slowdown',
        delay: 0,
        reason: 'Esperar a que el usuario baje la velocidad',
        shouldRespond: false
      },
      
      // 8. Usuario escribiendo + velocidad moderada
      {
        condition: userTyping && userTypingSpeed > 6 && userTypingSpeed <= 12,
        action: 'respond_to_moderate_speed',
        delay: 1200,
        reason: 'Velocidad moderada, responder con delay',
        shouldRespond: true
      },
      
      // 9. Usuario no escribiendo + mensajes pendientes
      {
        condition: !userTyping && messageCount > 0,
        action: 'respond_normally',
        delay: 500,
        reason: 'Usuario terminó de escribir',
        shouldRespond: true
      },
      
      // 10. FALLBACK - Si no se cumple ninguna condición específica
      {
        condition: messageCount > 0,
        action: 'respond_fallback',
        delay: 800,
        reason: 'Responder por defecto después de delay',
        shouldRespond: true
      }
    ];

    // Evaluar condiciones en orden de prioridad
    for (const decision of decisionMatrix) {
      if (decision.condition) {
        return {
          shouldRespond: decision.shouldRespond,
          delay: decision.delay,
          strategy: decision.action,
          reason: decision.reason,
          crossedWithUser: userTyping && decision.shouldRespond
        };
      }
    }

    // Decisión por defecto (más agresiva)
    return {
      shouldRespond: true,
      delay: 1000,
      strategy: 'respond_default',
      reason: 'Responder por defecto',
      crossedWithUser: false
    };
  }

  /**
   * Analiza el tono de la conversación
   */
  static analyzeConversationTone(messages: string[]): 'normal' | 'urgent' | 'emotional' | 'intense' {
    const urgentKeywords = ['urgente', 'rápido', 'ahora', 'inmediato', 'pronto', 'ya'];
    const emotionalKeywords = ['😭', '😢', '😱', '😡', '😤', 'desesperado', 'necesito', 'ayuda'];
    const intenseKeywords = ['🔥', '💦', '😈', 'fuerte', 'intenso', 'pasión'];
    
    const allText = messages.join(' ').toLowerCase();
    
    const urgentCount = urgentKeywords.filter(keyword => 
      allText.includes(keyword)
    ).length;
    
    const emotionalCount = emotionalKeywords.filter(keyword => 
      allText.includes(keyword)
    ).length;
    
    const intenseCount = intenseKeywords.filter(keyword => 
      allText.includes(keyword)
    ).length;
    
    if (urgentCount >= 2) return 'urgent';
    if (emotionalCount >= 3) return 'emotional';
    if (intenseCount >= 2 || messages.length > 5) return 'intense';
    
    return 'normal';
  }

  /**
   * Calcula la velocidad de escritura del usuario (MEJORADO)
   */
  static calculateTypingSpeed(messages: any[], timeWindow: number = 60000): number {
    const now = Date.now();
    const recentMessages = messages.filter(msg => 
      msg.isUser && (now - new Date(msg.timestamp).getTime()) < timeWindow
    );
    
    if (recentMessages.length < 2) return 0;
    
    const timeSpan = new Date(recentMessages[recentMessages.length - 1].timestamp).getTime() - 
                     new Date(recentMessages[0].timestamp).getTime();
    
    // Evitar división por cero y valores extremos
    if (timeSpan < 1000) return 60; // Si es muy rápido, asumir velocidad alta
    if (timeSpan > 300000) return 0; // Si es muy lento, asumir velocidad baja
    
    return Math.min((recentMessages.length / (timeSpan / 60000)), 60); // Cap a 60 msg/min
  }

  /**
   * Calcula el tiempo desde el último mensaje
   */
  static getTimeSinceLastMessage(messages: any[]): number {
    if (messages.length === 0) return 0;
    
    const lastMessage = messages[messages.length - 1];
    const lastMessageTime = new Date(lastMessage.timestamp).getTime();
    const now = Date.now();
    
    return now - lastMessageTime;
  }

  /**
   * Analiza la personalidad del avatar para determinar su comportamiento asíncrono
   */
  static analyzeAvatarBehavior(personality: string): {
    isDominant: boolean;
    type: string;
    responseDelay: number;
    assertiveness: number;
  } {
    const lowerPersonality = personality.toLowerCase();
    
    // Definir patrones de personalidad
    const dominantPatterns = [
      'dominante', 'dominación', 'dominant', 'assertive', 'assertivo',
      'segura de sí misma', 'seguro de sí mismo', 'confiada', 'confiado',
      'directa', 'directo', 'sin inhibiciones', 'experimentada', 'experimentado',
      'poder', 'control', 'humillación', 'cuckold'
    ];
    
    const submissivePatterns = [
      'sumisa', 'sumiso', 'sumisión', 'submissive', 'tímida', 'tímido',
      'inocente', 'dulce', 'suave', 'nerviosa', 'nervioso', 'curiosa', 'curioso',
      'exploradora', 'explorador', 'deseo latente'
    ];
    
    const assertivePatterns = [
      'assertive', 'assertivo', 'directa', 'directo', 'experimentada', 'experimentado',
      'segura', 'seguro', 'confiada', 'confiado', 'sin inhibiciones'
    ];
    
    // Contar coincidencias
    const dominantCount = dominantPatterns.filter(pattern => 
      lowerPersonality.includes(pattern)
    ).length;
    
    const submissiveCount = submissivePatterns.filter(pattern => 
      lowerPersonality.includes(pattern)
    ).length;
    
    const assertiveCount = assertivePatterns.filter(pattern => 
      lowerPersonality.includes(pattern)
    ).length;
    
    // Determinar tipo de comportamiento
    let isDominant = false;
    let type = 'neutral';
    let responseDelay = 600; // Reducido de 1000 a 600
    let assertiveness = 0;
    
    if (dominantCount > 0) {
      isDominant = true;
      type = 'dominante';
      responseDelay = 400; // Reducido de 800 a 400
      assertiveness = Math.min(dominantCount / 3, 1); // 0-1
    } else if (assertiveCount > 0) {
      isDominant = true;
      type = 'assertivo';
      responseDelay = 600; // Reducido de 1000 a 600
      assertiveness = Math.min(assertiveCount / 2, 1);
    } else if (submissiveCount > 0) {
      isDominant = false;
      type = 'sumiso';
      responseDelay = 800; // Reducido de 1500 a 800
      assertiveness = 0;
    }
    
    console.log(`[AVATAR_BEHAVIOR] Personalidad: "${personality}"`);
    console.log(`[AVATAR_BEHAVIOR] Dominante: ${isDominant}, Tipo: ${type}, Delay: ${responseDelay}ms`);
    
    return {
      isDominant,
      type,
      responseDelay,
      assertiveness
    };
  }

  /**
   * Simula un delay natural basado en la longitud del mensaje (OPTIMIZADO)
   */
  static calculateNaturalDelay(messageLength: number, strategy: string): number {
    const baseDelay = 300; // Reducido de 500 a 300
    
    // Factor por longitud del mensaje
    const lengthFactor = Math.min(messageLength / 100, 1.5); // Reducido máximo de 2x a 1.5x
    
    // Factor por estrategia (OPTIMIZADO)
    const strategyFactors = {
      'respond_first_message': 0.2, // Muy rápido para primer mensaje
      'respond_immediately': 0.3,
      'respond_to_accumulated': 0.6,
      'respond_to_long_message': 1.0,
      'respond_assertively': 0.5,
      'respond_after_pause': 0.6,
      'respond_to_moderate_speed': 0.8,
      'respond_normally': 0.5,
      'respond_fallback': 0.6,
      'respond_default': 0.6
    };
    
    const strategyFactor = strategyFactors[strategy as keyof typeof strategyFactors] || 0.6;
    
    // Añadir aleatoriedad para simular comportamiento humano (reducida)
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 - 1.2 (más variabilidad pero menor base)
    
    return Math.round(baseDelay * lengthFactor * strategyFactor * randomFactor);
  }
} 