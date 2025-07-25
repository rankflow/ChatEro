interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

export class RetryService {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 segundo
    maxDelay: 10000, // 10 segundos
    backoffMultiplier: 2
  };

  /**
   * Ejecuta una función con reintentos automáticos
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
      try {
        console.log(`[RetryService] 🔄 Intento ${attempt}/${finalConfig.maxRetries + 1}...`);
        
        const result = await operation();
        const totalTime = Date.now() - startTime;
        
        console.log(`[RetryService] ✅ Operación exitosa en intento ${attempt} (${totalTime}ms)`);
        
        return {
          success: true,
          data: result,
          attempts: attempt,
          totalTime
        };
      } catch (error) {
        lastError = error as Error;
        const totalTime = Date.now() - startTime;
        
        console.error(`[RetryService] ❌ Error en intento ${attempt}:`, error);
        
        if (attempt <= finalConfig.maxRetries) {
          const delay = this.calculateDelay(attempt, finalConfig);
          console.log(`[RetryService] ⏳ Esperando ${delay}ms antes del siguiente intento...`);
          await this.sleep(delay);
        } else {
          console.error(`[RetryService] ❌ Todos los intentos fallaron después de ${totalTime}ms`);
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalTime
          };
        }
      }
    }

    // Esto nunca debería ejecutarse, pero por seguridad
    return {
      success: false,
      error: lastError!,
      attempts: finalConfig.maxRetries + 1,
      totalTime: Date.now() - startTime
    };
  }

  /**
   * Calcula el delay exponencial para el siguiente intento
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Pausa la ejecución por el tiempo especificado
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica si un error es recuperable (debe reintentarse)
   */
  static isRecoverableError(error: any): boolean {
    // Errores de red que pueden ser temporales
    if (error.code === 'ECONNRESET' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ENOTFOUND') {
      return true;
    }

    // Errores HTTP 5xx (errores del servidor)
    if (error.status >= 500 && error.status < 600) {
      return true;
    }

    // Errores de rate limiting (429)
    if (error.status === 429) {
      return true;
    }

    // Errores específicos de las APIs
    if (error.message?.includes('timeout') || 
        error.message?.includes('network') ||
        error.message?.includes('connection')) {
      return true;
    }

    return false;
  }

  /**
   * Configuración específica para APIs de IA
   */
  static getAIAPIConfig(): RetryConfig {
    return {
      maxRetries: 3,
      baseDelay: 2000, // 2 segundos para APIs de IA
      maxDelay: 15000, // 15 segundos máximo
      backoffMultiplier: 2
    };
  }
} 