import axios from 'axios';
import dotenv from 'dotenv';

// Cargar variables de entorno directamente en este módulo
dotenv.config();

const VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1';
const VENICE_API_KEY = process.env.VENICE_API_KEY;
const VENICE_MODEL = process.env.VENICE_MODEL || 'venice-uncensored';

export async function getVeniceResponse(messages: any[]): Promise<string> {
  try {


    // Los mensajes ya incluyen el prompt del sistema desde AIService
    const veniceMessages = messages;

    const payload = {
      model: VENICE_MODEL,
      messages: veniceMessages,
      max_tokens: 1000,
      temperature: 0.8,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    };

    const headers = {
      'Authorization': `Bearer ${VENICE_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(
      `${VENICE_API_URL}/chat/completions`,
      payload,
      {
        headers,
        timeout: 30000
      }
    );

    if (response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      return content;
    } else {
      console.error('🌊 Error: No se encontraron choices en la respuesta de Venice');
      throw new Error('Respuesta inválida de Venice AI');
    }

  } catch (error: any) {
    console.error('🌊 Error al conectar con Venice AI:', error.message);
    if (error.response) {
      console.error(' Detalles del error:', error.response.data);
    }
    throw new Error(`Error de conexión con Venice AI: ${error.message}`);
  }
} 