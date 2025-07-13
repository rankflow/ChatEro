# Integración de Venice Uncensored en Chat Ero

## Resumen

Chat Ero ahora usa exclusivamente Venice Uncensored como modelo de IA. Se ha eliminado completamente el soporte para Mistral y otros modelos obsoletos.

## Configuración

### Variables de entorno necesarias

Añade estas variables a tu archivo `.env`:

```env
# Venice Uncensored
USE_VENICE_MODEL=true
VENICE_API_KEY=2lVrq2Li0x6EPvpEavss544mEd7xF3OY1kVVTzDzmS
VENICE_API_URL=https://api.venice.ai/api/v1/chat/completions
VENICE_MODEL=venice-uncensored
```

### Dependencias

Se ha instalado `axios` como dependencia para las peticiones HTTP:

```bash
npm install axios
```

## Funcionamiento

### Modelo único

El sistema usa exclusivamente Venice Uncensored como modelo de IA.

### Flujo de funcionamiento

1. El usuario envía un mensaje
2. El sistema usa Venice Uncensored directamente
3. Se mantiene toda la lógica de prompts y avatares existente

### Logs de debug

El sistema imprime logs detallados para facilitar el debugging:

```
🚀 Usando modelo Venice Uncensored
🌊 Usando Venice AI con modelo: venice-uncensored
🌊 Endpoint Venice: https://api.venice.ai/api/v1/chat/completions
🌊 Enviando petición a Venice con payload: {...}
🌊 Respuesta de Venice recibida: 200
 Contenido extraído: [respuesta de Venice]
```

## Archivos modificados

### Nuevos archivos
- `src/services/veniceAI.ts` - Servicio para conectar con Venice Uncensored

### Archivos modificados
- `src/services/aiService.ts` - Nuevo servicio de IA usando Venice
- `env.example` - Añadidas variables de Venice

## Manejo de errores

- **Si Venice falla**: Se muestra un mensaje de error de conexión
- **No hay fallback automático**: El sistema no vuelve a Mistral automáticamente
- **Logs detallados**: Se registran todos los errores para debugging

## Características mantenidas

✅ **NO se modifican** los prompts existentes
✅ **NO se cambia** la lógica de avatares
✅ **NO se alteran** los endpoints de la API
✅ **NO se modifica** la validación de contenido
✅ **NO se cambia** la estructura de respuestas

## Configuración

El sistema usa Venice Uncensored por defecto. No es necesario configurar variables adicionales.

## Testing

Para probar la integración:

1. Asegúrate de que las variables de entorno estén configuradas
2. Reinicia el servidor backend
3. Envía un mensaje desde el frontend
4. Verifica los logs en la consola del backend

## Notas importantes

- El modelo correcto es `venice-uncensored`
- El timeout está configurado a 30 segundos
- Los tokens usados se establecen en 0 para Venice (no los devuelve)
- Se mantiene toda la funcionalidad existente intacta 