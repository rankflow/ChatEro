# 🔍 Debug de Conversación - Cómo Consultar el JSON

## 📋 Opciones para Consultar el JSON de la Conversación

### **1. Logs del Backend (Recomendado)**

Los logs del backend muestran información detallada en tiempo real:

```bash
# En la consola donde corre el backend verás:
[DEBUG] Historial recibido: 4 mensajes
[DEBUG] Historial completo: [
  {
    "role": "user",
    "content": "Hola"
  },
  {
    "role": "assistant", 
    "content": "Hola guapo, soy Aria. Encantada de conocerte..."
  }
]

[DEBUG] Memoria completa: {
  "summary": "El usuario inició conversación con Aria...",
  "turnCount": 2,
  "dominantTone": "dulce",
  "avatarIntroduced": true
}

[VENICE] Mensajes enviados a Venice: [
  {
    "role": "system",
    "content": "Eres Aria, una chica dulce y sumisa..."
  },
  {
    "role": "system", 
    "content": "CONTEXTO DE LA CONVERSACIÓN ANTERIOR..."
  },
  {
    "role": "user",
    "content": "Hola"
  }
]
```

### **2. Endpoint de Debug**

```bash
# GET http://localhost:3001/api/chat/debug
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/chat/debug
```

### **3. Herramientas de Desarrollo del Navegador**

1. **Network Tab**: Ve a DevTools → Network
2. **Filtra por "message"**: Busca requests a `/api/chat/message`
3. **Revisa Request/Response**: Verás el JSON completo enviado/recibido

### **4. Console del Frontend**

En el navegador, abre DevTools → Console y verás:
```javascript
// Los mensajes se muestran en el chat
// La memoria se actualiza automáticamente
```

## 📊 Estructura del JSON de Conversación

### **Request al Backend:**
```json
{
  "message": "Hola",
  "avatarId": "avatar_3",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hola"
    },
    {
      "role": "assistant", 
      "content": "Hola guapo, soy Aria..."
    }
  ],
  "conversationMemory": {
    "summary": "Conversación iniciada...",
    "turnCount": 1,
    "dominantTone": "dulce",
    "avatarIntroduced": true,
    "boundariesDiscussed": [],
    "fantasiesExplored": []
  }
}
```

### **Response del Backend:**
```json
{
  "success": true,
  "message": "¡Hola! ¿Cómo estás?",
  "timestamp": "2024-01-15T17:30:00.000Z",
  "messageId": "msg_1234567890",
  "tokensUsed": 0,
  "conversationMemory": {
    "summary": "Usuario inició conversación...",
    "turnCount": 2,
    "dominantTone": "dulce",
    "avatarIntroduced": true
  }
}
```

## 🎯 Información Disponible

### **En los Logs del Backend:**
- ✅ Historial completo de mensajes
- ✅ Memoria contextual actualizada
- ✅ Mensajes enviados a Venice
- ✅ Contexto completo del avatar
- ✅ Timestamps y metadatos

### **En el Frontend:**
- ✅ Mensajes visibles en el chat
- ✅ Contador de memoria en el header
- ✅ Estado de la conversación en tiempo real

## 🔧 Para Activar Logs Detallados

Los logs ya están activados en el código. Solo necesitas:

1. **Ejecutar el backend**: `cd backend && npm run dev`
2. **Observar la consola**: Los logs aparecen automáticamente
3. **Enviar mensajes**: Cada mensaje genera logs detallados

## 📝 Notas Importantes

- **Memoria se actualiza cada 10 turnos**
- **Historial se mantiene en el frontend**
- **Logs muestran información sensible** (conversaciones completas)
- **Para producción, desactivar logs detallados** 