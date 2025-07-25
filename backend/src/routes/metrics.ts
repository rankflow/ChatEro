import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MetricsService } from '../services/metricsService.js';
import { BatchMemoryAnalysisService } from '../services/batchMemoryAnalysisService.js';

export default async function metricsRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/metrics
   * Obtiene las métricas del sistema de memoria
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const memoryMetrics = MetricsService.getMemoryMetrics();
      const recentBatches = MetricsService.getRecentBatchMetrics(10);
      const apiMetrics = MetricsService.getAPIMetrics();
      const performanceSummary = BatchMemoryAnalysisService.getPerformanceSummary();

      const metrics = {
        memory: memoryMetrics,
        recentBatches,
        apis: apiMetrics,
        performance: performanceSummary,
        timestamp: new Date().toISOString()
      };

      return reply.send({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('[Metrics] Error obteniendo métricas:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error obteniendo métricas'
      });
    }
  });

  /**
   * GET /api/metrics/report
   * Obtiene un reporte de rendimiento en formato texto
   */
  fastify.get('/report', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const report = MetricsService.generatePerformanceReport();
      
      reply.header('Content-Type', 'text/plain; charset=utf-8');
      return reply.send(report);
    } catch (error) {
      console.error('[Metrics] Error generando reporte:', error);
      return reply.status(500).send('Error generando reporte de métricas');
    }
  });

  /**
   * POST /api/metrics/cleanup
   * Limpia métricas antiguas
   */
  fastify.post('/cleanup', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      MetricsService.cleanupOldMetrics();
      
      return reply.send({
        success: true,
        message: 'Limpieza de métricas completada'
      });
    } catch (error) {
      console.error('[Metrics] Error en limpieza:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error en limpieza de métricas'
      });
    }
  });

  /**
   * POST /api/metrics/reset
   * Resetea todas las métricas
   */
  fastify.post('/reset', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      MetricsService.resetMetrics();
      BatchMemoryAnalysisService.clearPerformanceMetrics();
      
      return reply.send({
        success: true,
        message: 'Métricas reseteadas'
      });
    } catch (error) {
      console.error('[Metrics] Error reseteando métricas:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error reseteando métricas'
      });
    }
  });
} 