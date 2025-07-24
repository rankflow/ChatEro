import { PrismaClient, Message } from '@prisma/client';

const prisma = new PrismaClient();

interface ActivityLevel {
  lowActivity: number;    // minutos para poca actividad
  normalActivity: number; // minutos para actividad normal
  highActivity: number;   // minutos para mucha actividad
}

interface ConversationEndConfig {
  inactivityTimeout: ActivityLevel; // timeouts por nivel de actividad
  sessionTimeout: number; // minutos
  checkInterval: number; // segundos
  activityThresholds: {
    lowActivity: number;   // mensajes por hora para considerar baja actividad
    highActivity: number;  // mensajes por hora para considerar alta actividad
  };
}

interface PerformanceMetrics {
  totalTime: number;
  checkTimes: {
    inactivity: number;
    session: number;
    avatarChange: number;
    userLogout: number;
  };
  activityLevel: 'low' | 'normal' | 'high';
  messageCount: number;
  timestamp: Date;
}

export class ConversationEndDetectionService {
  private static readonly DEFAULT_CONFIG: ConversationEndConfig = {
    inactivityTimeout: {
      lowActivity: 15,    // 15 minutos si poca actividad
      normalActivity: 30, // 30 minutos normal
      highActivity: 45    // 45 minutos si mucha conversación
    },
    sessionTimeout: 120, // 2 horas de sesión
    checkInterval: 60, // verificar cada minuto
    activityThresholds: {
      lowActivity: 5,   // menos de 5 mensajes por hora = baja actividad
      highActivity: 20  // más de 20 mensajes por hora = alta actividad
    }
  };

  private static performanceMetrics: PerformanceMetrics[] = [];

  /**
   * Detecta si una conversación ha terminado con métricas de rendimiento
   */
  static async detectConversationEnd(userId: string, avatarId: string): Promise<boolean> {
    const startTime = Date.now();
    const metrics: PerformanceMetrics = {
      totalTime: 0,
      checkTimes: {
        inactivity: 0,
        session: 0,
        avatarChange: 0,
        userLogout: 0
      },
      activityLevel: 'normal',
      messageCount: 0,
      timestamp: new Date()
    };

    try {
      console.log(`[ConversationEndDetectionService] Verificando fin de conversación para usuario ${userId} y avatar ${avatarId}`);

      // Determinar nivel de actividad
      const activityLevel = await this.determineActivityLevel(userId, avatarId);
      metrics.activityLevel = activityLevel;

      // Obtener timeout apropiado según actividad
      const timeoutMinutes = this.getTimeoutForActivityLevel(activityLevel);
      console.log(`[ConversationEndDetectionService] Nivel de actividad: ${activityLevel}, timeout: ${timeoutMinutes} minutos`);

      // 1. Verificar timeout de inactividad
      const inactivityStart = Date.now();
      const isInactive = await this.checkInactivityTimeout(userId, avatarId, timeoutMinutes);
      metrics.checkTimes.inactivity = Date.now() - inactivityStart;
      
      if (isInactive) {
        console.log('[ConversationEndDetectionService] Conversación terminada por inactividad');
        this.recordMetrics(metrics, startTime);
        return true;
      }

      // 2. Verificar timeout de sesión
      const sessionStart = Date.now();
      const isSessionExpired = await this.checkSessionTimeout(userId, avatarId);
      metrics.checkTimes.session = Date.now() - sessionStart;
      
      if (isSessionExpired) {
        console.log('[ConversationEndDetectionService] Conversación terminada por timeout de sesión');
        this.recordMetrics(metrics, startTime);
        return true;
      }

      // 3. Verificar si el usuario cambió de avatar
      const avatarStart = Date.now();
      const hasAvatarChanged = await this.checkAvatarChange(userId, avatarId);
      metrics.checkTimes.avatarChange = Date.now() - avatarStart;
      
      if (hasAvatarChanged) {
        console.log('[ConversationEndDetectionService] Conversación terminada por cambio de avatar');
        this.recordMetrics(metrics, startTime);
        return true;
      }

      // 4. Verificar si el usuario cerró sesión
      const logoutStart = Date.now();
      const hasUserLoggedOut = await this.checkUserLogout(userId);
      metrics.checkTimes.userLogout = Date.now() - logoutStart;
      
      if (hasUserLoggedOut) {
        console.log('[ConversationEndDetectionService] Conversación terminada por cierre de sesión');
        this.recordMetrics(metrics, startTime);
        return true;
      }

      console.log('[ConversationEndDetectionService] Conversación aún activa');
      this.recordMetrics(metrics, startTime);
      return false;

    } catch (error) {
      console.error('[ConversationEndDetectionService] Error detectando fin de conversación:', error);
      this.recordMetrics(metrics, startTime);
      return false;
    }
  }

  /**
   * Determina el nivel de actividad del usuario
   */
  private static async determineActivityLevel(userId: string, avatarId: string): Promise<'low' | 'normal' | 'high'> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const messageCount = await prisma.message.count({
        where: {
          userId,
          avatarId,
          createdAt: {
            gte: oneHourAgo
          }
        }
      });

      if (messageCount < this.DEFAULT_CONFIG.activityThresholds.lowActivity) {
        return 'low';
      } else if (messageCount > this.DEFAULT_CONFIG.activityThresholds.highActivity) {
        return 'high';
      } else {
        return 'normal';
      }
    } catch (error) {
      console.error('[ConversationEndDetectionService] Error determinando nivel de actividad:', error);
      return 'normal';
    }
  }

  /**
   * Obtiene el timeout apropiado según el nivel de actividad
   */
  private static getTimeoutForActivityLevel(activityLevel: 'low' | 'normal' | 'high'): number {
    switch (activityLevel) {
      case 'low':
        return this.DEFAULT_CONFIG.inactivityTimeout.lowActivity;
      case 'high':
        return this.DEFAULT_CONFIG.inactivityTimeout.highActivity;
      default:
        return this.DEFAULT_CONFIG.inactivityTimeout.normalActivity;
    }
  }

  /**
   * Registra métricas de rendimiento
   */
  private static recordMetrics(metrics: PerformanceMetrics, startTime: number): void {
    metrics.totalTime = Date.now() - startTime;
    
    // Mantener solo las últimas 100 métricas
    this.performanceMetrics.push(metrics);
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }

    // Log de métricas cada 10 ejecuciones
    if (this.performanceMetrics.length % 10 === 0) {
      this.logPerformanceSummary();
    }
  }

  /**
   * Registra un resumen de rendimiento
   */
  private static logPerformanceSummary(): void {
    const recentMetrics = this.performanceMetrics.slice(-10);
    const avgTotalTime = recentMetrics.reduce((sum, m) => sum + m.totalTime, 0) / recentMetrics.length;
    const avgInactivityTime = recentMetrics.reduce((sum, m) => sum + m.checkTimes.inactivity, 0) / recentMetrics.length;
    
    console.log(`[ConversationEndDetectionService] Métricas de rendimiento (últimas 10 ejecuciones):`);
    console.log(`  - Tiempo total promedio: ${avgTotalTime.toFixed(2)}ms`);
    console.log(`  - Tiempo verificación inactividad: ${avgInactivityTime.toFixed(2)}ms`);
    console.log(`  - Niveles de actividad: ${recentMetrics.map(m => m.activityLevel).join(', ')}`);
  }

  /**
   * Verifica timeout de inactividad con timeout dinámico
   */
  private static async checkInactivityTimeout(userId: string, avatarId: string, timeoutMinutes: number): Promise<boolean> {
    try {
      const lastMessage = await prisma.message.findFirst({
        where: {
          userId,
          avatarId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!lastMessage) {
        return false; // No hay mensajes, no se puede determinar inactividad
      }

      const now = new Date();
      const timeSinceLastMessage = now.getTime() - lastMessage.createdAt.getTime();
      const timeoutMs = timeoutMinutes * 60 * 1000; // convertir a milisegundos

      return timeSinceLastMessage > timeoutMs;

    } catch (error) {
      console.error('[ConversationEndDetectionService] Error verificando inactividad:', error);
      return false;
    }
  }

  /**
   * Verifica timeout de sesión
   */
  private static async checkSessionTimeout(userId: string, avatarId: string): Promise<boolean> {
    try {
      const firstMessage = await prisma.message.findFirst({
        where: {
          userId,
          avatarId
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      if (!firstMessage) {
        return false; // No hay mensajes, no se puede determinar timeout de sesión
      }

      const now = new Date();
      const sessionDuration = now.getTime() - firstMessage.createdAt.getTime();
      const sessionTimeoutMs = this.DEFAULT_CONFIG.sessionTimeout * 60 * 1000; // convertir a milisegundos

      return sessionDuration > sessionTimeoutMs;

    } catch (error) {
      console.error('[ConversationEndDetectionService] Error verificando timeout de sesión:', error);
      return false;
    }
  }

  /**
   * Verifica si el usuario cambió de avatar
   */
  private static async checkAvatarChange(userId: string, currentAvatarId: string): Promise<boolean> {
    try {
      // Buscar el último mensaje con un avatar diferente
      const lastMessageWithDifferentAvatar = await prisma.message.findFirst({
        where: {
          userId,
          avatarId: {
            not: currentAvatarId
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!lastMessageWithDifferentAvatar) {
        return false; // No hay mensajes con otros avatares
      }

      // Buscar el último mensaje con el avatar actual
      const lastMessageWithCurrentAvatar = await prisma.message.findFirst({
        where: {
          userId,
          avatarId: currentAvatarId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!lastMessageWithCurrentAvatar) {
        return false; // No hay mensajes con el avatar actual
      }

      // Si el mensaje con avatar diferente es más reciente, hubo cambio
      return lastMessageWithDifferentAvatar.createdAt > lastMessageWithCurrentAvatar.createdAt;

    } catch (error) {
      console.error('[ConversationEndDetectionService] Error verificando cambio de avatar:', error);
      return false;
    }
  }

  /**
   * Verifica si el usuario cerró sesión
   */
  private static async checkUserLogout(userId: string): Promise<boolean> {
    try {
      // Buscar sesiones activas del usuario
      const activeSessions = await prisma.session.findMany({
        where: {
          userId,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      // Si no hay sesiones activas, el usuario cerró sesión
      return activeSessions.length === 0;

    } catch (error) {
      console.error('[ConversationEndDetectionService] Error verificando cierre de sesión:', error);
      return false;
    }
  }

  /**
   * Obtiene el tiempo transcurrido desde el último mensaje
   */
  static async getTimeSinceLastMessage(userId: string, avatarId: string): Promise<number> {
    try {
      const lastMessage = await prisma.message.findFirst({
        where: {
          userId,
          avatarId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!lastMessage) {
        return 0;
      }

      const now = new Date();
      const timeSinceLastMessage = now.getTime() - lastMessage.createdAt.getTime();
      return Math.floor(timeSinceLastMessage / 1000 / 60); // devolver en minutos

    } catch (error) {
      console.error('[ConversationEndDetectionService] Error obteniendo tiempo desde último mensaje:', error);
      return 0;
    }
  }

  /**
   * Obtiene la duración total de la conversación
   */
  static async getConversationDuration(userId: string, avatarId: string): Promise<number> {
    try {
      const firstMessage = await prisma.message.findFirst({
        where: {
          userId,
          avatarId
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      const lastMessage = await prisma.message.findFirst({
        where: {
          userId,
          avatarId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!firstMessage || !lastMessage) {
        return 0;
      }

      const duration = lastMessage.createdAt.getTime() - firstMessage.createdAt.getTime();
      return Math.floor(duration / 1000 / 60); // devolver en minutos

    } catch (error) {
      console.error('[ConversationEndDetectionService] Error obteniendo duración de conversación:', error);
      return 0;
    }
  }

  /**
   * Actualiza la configuración de detección
   */
  static updateConfig(newConfig: Partial<ConversationEndConfig>): void {
    Object.assign(this.DEFAULT_CONFIG, newConfig);
    console.log('[ConversationEndDetectionService] Configuración actualizada:', this.DEFAULT_CONFIG);
  }

  /**
   * Obtiene la configuración actual
   */
  static getConfig(): ConversationEndConfig {
    return { ...this.DEFAULT_CONFIG };
  }

  /**
   * Obtiene métricas de rendimiento
   */
  static getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * Obtiene resumen de métricas de rendimiento
   */
  static getPerformanceSummary(): {
    totalExecutions: number;
    averageTotalTime: number;
    averageInactivityTime: number;
    activityLevelDistribution: Record<string, number>;
    lastExecution: Date | null;
  } {
    if (this.performanceMetrics.length === 0) {
      return {
        totalExecutions: 0,
        averageTotalTime: 0,
        averageInactivityTime: 0,
        activityLevelDistribution: {},
        lastExecution: null
      };
    }

    const avgTotalTime = this.performanceMetrics.reduce((sum, m) => sum + m.totalTime, 0) / this.performanceMetrics.length;
    const avgInactivityTime = this.performanceMetrics.reduce((sum, m) => sum + m.checkTimes.inactivity, 0) / this.performanceMetrics.length;
    
    const activityDistribution = this.performanceMetrics.reduce((acc, m) => {
      acc[m.activityLevel] = (acc[m.activityLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExecutions: this.performanceMetrics.length,
      averageTotalTime: avgTotalTime,
      averageInactivityTime: avgInactivityTime,
      activityLevelDistribution: activityDistribution,
      lastExecution: this.performanceMetrics[this.performanceMetrics.length - 1]?.timestamp || null
    };
  }

  /**
   * Limpia métricas de rendimiento
   */
  static clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
    console.log('[ConversationEndDetectionService] Métricas de rendimiento limpiadas');
  }

  /**
   * Verifica si una conversación está activa (método de conveniencia)
   */
  static async isConversationActive(userId: string, avatarId: string): Promise<boolean> {
    return !(await this.detectConversationEnd(userId, avatarId));
  }
} 