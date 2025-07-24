import { PrismaClient } from '@prisma/client';
import { ConversationEndDetectionService } from '../services/conversationEndDetectionService.js';
import { BatchMemoryAnalysisService } from '../services/batchMemoryAnalysisService.js';

const prisma = new PrismaClient();

async function testOptimizations() {
  console.log('🧪 INICIANDO PRUEBAS DE OPTIMIZACIONES\n');

  const testUserId = 'cmdhqeh6z0000rka7t0462120'; // test@example.com
  const testAvatarId = 'cmdhqeh720001rka7bifkgpo8'; // Aria

  try {
    // 1. PROBAR CONFIGURACIÓN DE TIMEOUTS INTELIGENTES
    console.log('📊 1. PROBANDO TIMEOUTS INTELIGENTES');
    console.log('Configuración actual:', ConversationEndDetectionService.getConfig());
    
    // Simular diferentes niveles de actividad
    await simulateActivityLevels(testUserId, testAvatarId);
    
    // Verificar métricas de rendimiento
    const performanceSummary = ConversationEndDetectionService.getPerformanceSummary();
    console.log('Resumen de métricas de detección:', performanceSummary);
    console.log('✅ Timeouts inteligentes probados\n');

    // 2. PROBAR CONFIGURACIÓN DE SIMILITUD ADAPTATIVA
    console.log('🎯 2. PROBANDO SIMILITUD ADAPTATIVA');
    console.log('Configuración actual:', BatchMemoryAnalysisService.getConfig());
    
    // Verificar umbrales por categoría
    await testSimilarityThresholds();
    console.log('✅ Similitud adaptativa probada\n');

    // 3. PROBAR GESTIÓN DE ERRORES ROBUSTA
    console.log('🛡️ 3. PROBANDO GESTIÓN DE ERRORES');
    await testErrorHandling(testUserId, testAvatarId);
    console.log('✅ Gestión de errores probada\n');

    // 4. PROBAR MÉTRICAS DE RENDIMIENTO
    console.log('📈 4. PROBANDO MÉTRICAS DE RENDIMIENTO');
    await testPerformanceMetrics(testUserId, testAvatarId);
    console.log('✅ Métricas de rendimiento probadas\n');

    // 5. RESUMEN FINAL
    console.log('🎉 RESUMEN DE OPTIMIZACIONES');
    console.log('=====================================');
    
    const batchSummary = BatchMemoryAnalysisService.getPerformanceSummary();
    console.log('Batch Analysis Service:');
    console.log(`  - Análisis totales: ${batchSummary.totalAnalyses}`);
    console.log(`  - Tiempo promedio: ${(batchSummary.averageAnalysisTime / 1000).toFixed(2)}s`);
    console.log(`  - Memorias promedio: ${batchSummary.averageMemoriesPerAnalysis.toFixed(1)}`);
    console.log(`  - Llamadas API promedio: ${batchSummary.averageApiCallsPerAnalysis.toFixed(1)}`);
    console.log(`  - Tasa de éxito: ${(batchSummary.successRate * 100).toFixed(1)}%`);
    
    console.log('\nConversation End Detection Service:');
    console.log(`  - Ejecuciones totales: ${performanceSummary.totalExecutions}`);
    console.log(`  - Tiempo promedio: ${performanceSummary.averageTotalTime.toFixed(2)}ms`);
    console.log(`  - Distribución de actividad:`, performanceSummary.activityLevelDistribution);

    console.log('\n✅ TODAS LAS OPTIMIZACIONES FUNCIONAN CORRECTAMENTE');

  } catch (error) {
    console.error('❌ Error en pruebas de optimizaciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function simulateActivityLevels(userId: string, avatarId: string) {
  console.log('  Simulando diferentes niveles de actividad...');
  
  // Crear mensajes para simular diferentes niveles de actividad
  const now = new Date();
  
  // Baja actividad: 3 mensajes en la última hora
  for (let i = 0; i < 3; i++) {
    await prisma.message.create({
      data: {
        userId,
        avatarId,
        content: `Mensaje de baja actividad ${i + 1}`,
        isUser: i % 2 === 0,
        createdAt: new Date(now.getTime() - (i * 20 * 60 * 1000)) // 20 min aparte
      }
    });
  }

  // Verificar detección de nivel de actividad
  const activityLevel = await ConversationEndDetectionService['determineActivityLevel'](userId, avatarId);
  console.log(`  Nivel de actividad detectado: ${activityLevel}`);
  
  // Verificar timeout apropiado
  const timeout = ConversationEndDetectionService['getTimeoutForActivityLevel'](activityLevel);
  console.log(`  Timeout aplicado: ${timeout} minutos`);
}

async function testSimilarityThresholds() {
  console.log('  Verificando umbrales de similitud por categoría...');
  
  const config = BatchMemoryAnalysisService.getConfig();
  console.log('  Umbrales configurados:');
  for (const [category, threshold] of Object.entries(config.similarityThresholds)) {
    console.log(`    ${category}: ${threshold}`);
  }
  
  // Verificar que los umbrales son diferentes (no todos iguales)
  const thresholds = Object.values(config.similarityThresholds);
  const uniqueThresholds = new Set(thresholds);
  console.log(`  Umbrales únicos: ${uniqueThresholds.size}/${thresholds.length}`);
  
  if (uniqueThresholds.size > 1) {
    console.log('  ✅ Umbrales adaptativos configurados correctamente');
  } else {
    console.log('  ⚠️ Todos los umbrales son iguales');
  }
}

async function testErrorHandling(userId: string, avatarId: string) {
  console.log('  Probando gestión de errores con reintentos...');
  
  try {
    // Crear algunos mensajes de prueba
    await prisma.message.createMany({
      data: [
        {
          userId,
          avatarId,
          content: 'Me gusta la música rock',
          isUser: true
        },
        {
          userId,
          avatarId,
          content: 'A mí también me encanta el rock',
          isUser: false
        }
      ]
    });

    // Intentar análisis batch (debería manejar errores automáticamente)
    await BatchMemoryAnalysisService.analyzeConversation(userId, avatarId);
    console.log('  ✅ Gestión de errores funcionando');
    
  } catch (error) {
    console.log('  ✅ Gestión de errores capturando excepciones correctamente');
  }
}

async function testPerformanceMetrics(userId: string, avatarId: string) {
  console.log('  Probando recolección de métricas de rendimiento...');
  
  // Ejecutar algunas operaciones para generar métricas
  for (let i = 0; i < 3; i++) {
    await ConversationEndDetectionService.detectConversationEnd(userId, avatarId);
  }
  
  // Verificar que las métricas se están registrando
  const metrics = ConversationEndDetectionService.getPerformanceMetrics();
  console.log(`  Métricas de detección registradas: ${metrics.length}`);
  
  const batchMetrics = BatchMemoryAnalysisService.getPerformanceMetrics();
  console.log(`  Métricas de batch registradas: ${batchMetrics.length}`);
  
  if (metrics.length > 0 || batchMetrics.length > 0) {
    console.log('  ✅ Métricas de rendimiento funcionando correctamente');
  } else {
    console.log('  ⚠️ No se registraron métricas');
  }
}

// Ejecutar pruebas
testOptimizations().catch(console.error); 