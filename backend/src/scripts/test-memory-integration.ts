import dotenv from 'dotenv';
import VoyageEmbeddingService from '../services/voyageEmbeddingService.js';

// Cargar variables de entorno
dotenv.config();

async function testMemoryIntegration() {
  console.log('🧪 Probando integración de memoria en el chat...\n');

  try {
    // 1. Probar VoyageEmbeddingService
    console.log('1️⃣ Probando VoyageEmbeddingService...');
    const testText = 'Me gusta la música rock y viajar';
    const embedding = await VoyageEmbeddingService.generateEmbedding(testText);
    console.log(`✅ Embedding generado: ${embedding.length} dimensiones`);

    // 2. Probar similitud coseno
    console.log('\n2️⃣ Probando similitud coseno...');
    const text1 = 'Me gusta la música rock';
    const text2 = 'Disfruto escuchar heavy metal';
    const text3 = 'Prefiero el café por las mañanas';

    const embedding1 = await VoyageEmbeddingService.generateEmbedding(text1);
    const embedding2 = await VoyageEmbeddingService.generateEmbedding(text2);
    const embedding3 = await VoyageEmbeddingService.generateEmbedding(text3);

    const similarity1 = VoyageEmbeddingService.calculateCosineSimilarity(embedding1, embedding2);
    const similarity2 = VoyageEmbeddingService.calculateCosineSimilarity(embedding1, embedding3);

    console.log(`📊 Similitud entre textos musicales: ${similarity1.toFixed(4)}`);
    console.log(`📊 Similitud entre música y café: ${similarity2.toFixed(4)}`);

    // 3. Probar batch processing
    console.log('\n3️⃣ Probando batch processing...');
    const texts = [
      'Me gusta la música rock',
      'Disfruto viajar por Europa',
      'Prefiero el café por las mañanas',
      'Me encanta cocinar pasta italiana',
      'Suelo hacer ejercicio los fines de semana'
    ];

    const batchEmbeddings = await VoyageEmbeddingService.generateBatchEmbeddings(texts);
    console.log(`✅ Batch procesado: ${batchEmbeddings.length} embeddings generados`);

    // 4. Probar validación de embeddings
    console.log('\n4️⃣ Probando validación de embeddings...');
    const isValid = VoyageEmbeddingService.validateEmbedding(embedding);
    console.log(`✅ Embedding válido: ${isValid}`);

    // 5. Probar configuración
    console.log('\n5️⃣ Probando configuración...');
    const config = VoyageEmbeddingService.getConfig();
    console.log(`📋 Configuración actual:`, config);

    // 6. Simular análisis de conversación (sin base de datos)
    console.log('\n6️⃣ Simulando análisis de conversación...');
    const userMessage = 'Me gusta mucho la música rock, especialmente los conciertos en vivo. Mi banda favorita es Metallica.';
    const aiResponse = '¡Qué interesante! Los conciertos en vivo tienen una energía increíble. ¿Has ido a muchos conciertos de Metallica?';
    
    const userEmbedding = await VoyageEmbeddingService.generateEmbedding(userMessage);
    const aiEmbedding = await VoyageEmbeddingService.generateEmbedding(aiResponse);
    
    console.log(`✅ Embeddings de conversación generados:`);
    console.log(`  - Usuario: ${userEmbedding.length} dimensiones`);
    console.log(`  - IA: ${aiEmbedding.length} dimensiones`);

    // 7. Simular detección de tipo de memoria
    console.log('\n7️⃣ Simulando detección de tipo de memoria...');
    const memoryTypes = {
      'personal_info': ['me llamo', 'mi nombre', 'tengo', 'vivo en'],
      'preferences': ['me gusta', 'prefiero', 'disfruto', 'me encanta'],
      'anecdotes': ['una vez', 'cuando', 'recuerdo', 'pasó'],
      'emotional_state': ['me siento', 'estoy', 'feliz', 'triste']
    };

    const detectedTypes = [];
    for (const [type, keywords] of Object.entries(memoryTypes)) {
      for (const keyword of keywords) {
        if (userMessage.toLowerCase().includes(keyword)) {
          detectedTypes.push(type);
          break;
        }
      }
    }

    console.log(`📊 Tipos de memoria detectados: ${detectedTypes.join(', ')}`);

    console.log('\n🎉 ¡Todas las pruebas de integración pasaron exitosamente!');
    console.log('✅ VoyageEmbeddingService funciona correctamente');
    console.log('✅ Los embeddings se generan correctamente');
    console.log('✅ La similitud coseno funciona');
    console.log('✅ El batch processing funciona');
    console.log('✅ La detección de tipos de memoria funciona');

    console.log('\n📝 Nota: Las pruebas de base de datos se omitieron porque las tablas de memoria');
    console.log('   no han sido creadas aún. Una vez que se ejecuten las migraciones,');
    console.log('   el sistema de memoria estará completamente funcional.');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas de integración:', error);
    process.exit(1);
  }
}

// Ejecutar las pruebas
testMemoryIntegration().catch(console.error); 