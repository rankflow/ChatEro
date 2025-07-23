import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testVoyageAPI() {
  console.log('🧪 Probando API de Voyage AI...\n');
  
  const apiKey = process.env.VOYAGE_API_KEY;
  console.log(`📋 API Key configurada: ${apiKey ? 'Sí' : 'No'}`);
  console.log(`🔑 Formato de API Key: ${apiKey?.substring(0, 10)}...`);
  
  if (!apiKey) {
    console.error('❌ No se encontró VOYAGE_API_KEY en las variables de entorno');
    return;
  }

  // Probar diferentes formatos de la API key
  const testCases = [
    {
      name: 'Formato original',
      key: apiKey,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Sin Bearer',
      key: apiKey,
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Con X-API-Key',
      key: apiKey,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  ] as const;

  for (const testCase of testCases) {
    console.log(`\n🔍 Probando: ${testCase.name}`);
    
    try {
      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: testCase.headers,
        body: JSON.stringify({
          model: 'voyage-3-large',
          input: 'test'
        })
      });

      console.log(`📊 Status: ${response.status}`);
      console.log(`📋 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      
      const responseText = await response.text();
      console.log(`📄 Response: ${responseText.substring(0, 200)}...`);
      
      if (response.ok) {
        console.log(`✅ ${testCase.name} - ÉXITO`);
        const data = JSON.parse(responseText);
        console.log(`📊 Embedding generado: ${data.data[0].embedding.length} dimensiones`);
        return;
      } else {
        console.log(`❌ ${testCase.name} - FALLÓ`);
      }
      
    } catch (error) {
      console.error(`❌ ${testCase.name} - Error:`, error);
    }
  }

  console.log('\n🔍 Información adicional:');
  console.log('📋 Verifica que la API key sea válida en: https://console.voyageai.com/');
  console.log('📋 Asegúrate de que tienes créditos disponibles');
  console.log('📋 Verifica que el modelo voyage-3-large esté disponible');
}

// Ejecutar la prueba
testVoyageAPI().catch(console.error); 