import VoyageEmbeddingService from '../services/voyageEmbeddingService.js';

async function testVoyageConnection() {
  console.log('🧪 Probando conexión con Voyage AI...\n');

  try {
    // 1. Probar conexión básica
    console.log('1️⃣ Probando conexión básica...');
    const isConnected = await VoyageEmbeddingService.testConnection();
    
    if (!isConnected) {
      console.error('❌ No se pudo conectar con Voyage AI');
      process.exit(1);
    }

    // 2. Probar generación de embedding individual
    console.log('\n2️⃣ Probando generación de embedding individual...');
    const testText = 'Me encanta viajar a Italia y comer pizza';
    const embedding = await VoyageEmbeddingService.generateEmbedding(testText);
    
    console.log(`✅ Embedding generado: ${embedding.length} dimensiones`);
    console.log(`📊 Primeras 5 dimensiones: [${embedding.slice(0, 5).join(', ')}...]`);

    // 3. Probar validación de embedding
    console.log('\n3️⃣ Probando validación de embedding...');
    const isValid = VoyageEmbeddingService.validateEmbedding(embedding);
    console.log(`✅ Embedding válido: ${isValid}`);

    // 4. Probar batch processing
    console.log('\n4️⃣ Probando batch processing...');
    const testTexts = [
      'Me gusta la música rock',
      'Prefiero el café por las mañanas',
      'Disfruto leer libros de ciencia ficción',
      'Me encanta cocinar pasta italiana',
      'Suelo hacer ejercicio los fines de semana'
    ];

    const batchEmbeddings = await VoyageEmbeddingService.generateBatchEmbeddings(testTexts);
    console.log(`✅ Batch procesado: ${batchEmbeddings.length} embeddings generados`);

    // 5. Probar similitud coseno
    console.log('\n5️⃣ Probando similitud coseno...');
    const similarity1 = VoyageEmbeddingService.calculateCosineSimilarity(
      batchEmbeddings[0], 
      batchEmbeddings[1]
    );
    const similarity2 = VoyageEmbeddingService.calculateCosineSimilarity(
      batchEmbeddings[0], 
      batchEmbeddings[0]
    );

    console.log(`📊 Similitud entre textos diferentes: ${similarity1.toFixed(4)}`);
    console.log(`📊 Similitud consigo mismo: ${similarity2.toFixed(4)}`);

    // 6. Probar configuración
    console.log('\n6️⃣ Probando configuración...');
    const config = VoyageEmbeddingService.getConfig();
    console.log('📋 Configuración actual:', config);

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ Voyage AI está configurado correctamente');
    console.log('✅ El servicio está listo para usar');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar las pruebas
testVoyageConnection().catch(console.error); 