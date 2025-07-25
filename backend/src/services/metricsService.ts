interface MemoryMetrics {
  totalConversations: number;
  totalMemories: number;
  averageMemoriesPerConversation: number;
  averageAnalysisTime: number;
  successRate: number;
  lastUpdated: Date;
}

interface BatchMetrics {
  batchId: string;
  userId: string;
  avatarId: string;
  messagesCount: number;
  batchesCount: number;
  memoriesExtracted: number;
  analysisTime: number;
  success: boolean;
  errors: string[];
  timestamp: Date;
}

interface APIMetrics {
  service: 'venice' | 'voyage';
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  lastCall: Date;
}

export class MetricsService {
  private static memoryMetrics: MemoryMetrics = {
    totalConversations: 0,
    totalMemories: 0,
    averageMemoriesPerConversation: 0,
    averageAnalysisTime: 0,
    successRate: 0,
    lastUpdated: new Date()
  };

  private static batchMetrics: BatchMetrics[] = [];
  private static apiMetrics: Map<string, APIMetrics> = new Map();

  /**
   * Registra una nueva conversación analizada
   */
  static recordConversationAnalysis(
    userId: string,
    avatarId: string,
    messagesCount: number,
    memoriesExtracted: number,
    analysisTime: number,
    success: boolean,
    errors: string[] = []
  ): void {
    const batchId = `${userId}-${avatarId}-${Date.now()}`;
    
    const batchMetric: BatchMetrics = {
      batchId,
      userId,
      avatarId,
      messagesCount,
      batchesCount: Math.ceil(messagesCount / 80), // Estimación basada en 80 mensajes por batch
      memoriesExtracted,
      analysisTime,
      success,
      errors,
      timestamp: new Date()
    };

    this.batchMetrics.push(batchMetric);

    // Actualizar métricas generales
    if (success) {
      this.memoryMetrics.totalConversations++;
      this.memoryMetrics.totalMemories += memoriesExtracted;
      this.memoryMetrics.averageMemoriesPerConversation = 
        this.memoryMetrics.totalMemories / this.memoryMetrics.totalConversations;
    }

    // Calcular tiempo promedio de análisis
    const successfulBatches = this.batchMetrics.filter(b => b.success);
    if (successfulBatches.length > 0) {
      this.memoryMetrics.averageAnalysisTime = 
        successfulBatches.reduce((sum, b) => sum + b.analysisTime, 0) / successfulBatches.length;
    }

    // Calcular tasa de éxito
    this.memoryMetrics.successRate = 
      (this.batchMetrics.filter(b => b.success).length / this.batchMetrics.length) * 100;

    this.memoryMetrics.lastUpdated = new Date();

    console.log(`[MetricsService] 📊 Métricas actualizadas: ${memoriesExtracted} memorias extraídas en ${analysisTime}ms`);
  }

  /**
   * Registra una llamada a API
   */
  static recordAPICall(
    service: 'venice' | 'voyage',
    success: boolean,
    responseTime: number
  ): void {
    const key = service;
    const current = this.apiMetrics.get(key) || {
      service,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0,
      lastCall: new Date()
    };

    current.totalCalls++;
    current.lastCall = new Date();

    if (success) {
      current.successfulCalls++;
    } else {
      current.failedCalls++;
    }

    // Calcular tiempo promedio de respuesta
    const totalTime = current.averageResponseTime * (current.totalCalls - 1) + responseTime;
    current.averageResponseTime = totalTime / current.totalCalls;

    this.apiMetrics.set(key, current);

    console.log(`[MetricsService] 🌐 API ${service}: ${success ? '✅' : '❌'} en ${responseTime}ms`);
  }

  /**
   * Obtiene las métricas de memoria
   */
  static getMemoryMetrics(): MemoryMetrics {
    return { ...this.memoryMetrics };
  }

  /**
   * Obtiene las métricas de batches recientes
   */
  static getRecentBatchMetrics(limit: number = 10): BatchMetrics[] {
    return this.batchMetrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Obtiene las métricas de APIs
   */
  static getAPIMetrics(): APIMetrics[] {
    return Array.from(this.apiMetrics.values());
  }

  /**
   * Genera un reporte de rendimiento
   */
  static generatePerformanceReport(): string {
    const memory = this.getMemoryMetrics();
    const recentBatches = this.getRecentBatchMetrics(5);
    const apis = this.getAPIMetrics();

    let report = `📊 REPORTE DE RENDIMIENTO - ${new Date().toLocaleString()}\n\n`;
    
    report += `🧠 MÉTRICAS DE MEMORIA:\n`;
    report += `- Conversaciones analizadas: ${memory.totalConversations}\n`;
    report += `- Memorias totales: ${memory.totalMemories}\n`;
    report += `- Promedio memorias/conversación: ${memory.averageMemoriesPerConversation.toFixed(2)}\n`;
    report += `- Tiempo promedio análisis: ${memory.averageAnalysisTime.toFixed(0)}ms\n`;
    report += `- Tasa de éxito: ${memory.successRate.toFixed(1)}%\n\n`;

    report += `🌐 MÉTRICAS DE APIs:\n`;
    apis.forEach(api => {
      const successRate = (api.successfulCalls / api.totalCalls) * 100;
      report += `- ${api.service.toUpperCase()}: ${api.totalCalls} llamadas, ${successRate.toFixed(1)}% éxito, ${api.averageResponseTime.toFixed(0)}ms promedio\n`;
    });

    report += `\n📈 BATCHES RECIENTES:\n`;
    recentBatches.forEach(batch => {
      const status = batch.success ? '✅' : '❌';
      report += `- ${status} ${batch.userId}/${batch.avatarId}: ${batch.memoriesExtracted} memorias en ${batch.analysisTime}ms\n`;
    });

    return report;
  }

  /**
   * Limpia métricas antiguas (más de 24 horas)
   */
  static cleanupOldMetrics(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.batchMetrics = this.batchMetrics.filter(b => b.timestamp > oneDayAgo);
    console.log(`[MetricsService] 🧹 Limpieza de métricas completada`);
  }

  /**
   * Resetea todas las métricas
   */
  static resetMetrics(): void {
    this.memoryMetrics = {
      totalConversations: 0,
      totalMemories: 0,
      averageMemoriesPerConversation: 0,
      averageAnalysisTime: 0,
      successRate: 0,
      lastUpdated: new Date()
    };
    this.batchMetrics = [];
    this.apiMetrics.clear();
    console.log(`[MetricsService] 🔄 Métricas reseteadas`);
  }
} 