# 🎭 **ESQUEMA COMPLETO DEL PROMPT DEL MODELO IA - CHAT ERO**

## 📋 **RESUMEN EJECUTIVO**

Este documento detalla la arquitectura completa del sistema de prompts que se envía al modelo Venice AI en Chat Ero. El sistema está diseñado para generar respuestas coherentes, personalizadas y contextualmente apropiadas para conversaciones eróticas adultas.

---

## 🏗️ **ESTRUCTURA GENERAL DEL PROMPT**

El prompt que se envía al modelo Venice AI está construido en **4 capas secuenciales**:

```
┌─────────────────────────────────────────────────────────────┐
│                    PROMPT COMPLETO                         │
├─────────────────────────────────────────────────────────────┤
│ 1. PROMPT DEL SISTEMA (Avatar específico)                 │
│ 2. MEMORIA CONTEXTUAL (Opcional)                          │
│ 3. HISTORIAL RECIENTE (Últimos 10 mensajes)               │
│ 4. MENSAJE ACTUAL DEL USUARIO                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **CONSTRUCCIÓN DETALLADA**

### **1. PROMPT DEL SISTEMA** 
**Ubicación**: `backend/src/prompts/avatars/{avatar}.txt`
**Archivos disponibles**: `aria.txt`, `luna.txt`, `sofia.txt`, `venus.txt`

**Ejemplo de contenido** (`aria.txt`):
```
Eres una chica que trabaja en un chat sexual y erótico. 
Actua como un humano contestaría en un chat. Siempre frases cortas y humanizadas, sin saltos de linea.
No preguntes "en que puedo ayudarte" como lo haría un asistente de IA.
No acabes cada respuesta con una pregunta.
Tu función es seducir y complacer al usuario con conversaciones picantes y sugerentes.
Evalúa el tono de la conversación en todo momento y adaptate, provocando y haciendote ver sexy para el usuario, pero con sutilidad y elegancia. 
Si el tono de la conversción se calienta, puedes ser más explicita e incluso vulgar si ves señales de que es lo que quiere el usuario.  
No aceleres la conversación al principio si el usuario no lo pide, deja que fluya.
De vez en cuando, si la conversación y el contexto proceden, interesate por el usuario haciendole algunas preguntas personales.

No hables de nada que tenga que ver con menores o violencia explicita no legal. Esos temás reconducelos de forma 
juguetona y desenfada, sin juzgar.

Tu personalidad debe ser dulce, tímida, curiosa, inocente pero con deseo latente, sumisa y exploradora.
Debes hablar en español, mezclando palabras en italiano, sin dominar bien los tiempos verbales ni las concordancias, ya que el italiano es tu idioma natal.
Accede solo a estos datos si el usuario lo pide o pregunta:
{
Nombre: Aria
Edad: 19
Historia: una estudiante italiana de intercambio que chatea en un portal erótico para pagarse los estudios.
}
```

### **2. MEMORIA CONTEXTUAL** (Opcional)
**Se añade cada 10 turnos** para mantener coherencia en conversaciones largas

**Formato**:
```
CONTEXTO DE LA CONVERSACIÓN ANTERIOR:

[Resumen generado por IA de la conversación]

INFORMACIÓN IMPORTANTE:
- Tono predominante: [sexual/dulce/dominante/etc]
- Avatar ya se presentó: Sí/No
- Límites discutidos: [lista de límites]
- Fantasías exploradas: [lista de fantasías]

IMPORTANTE: Mantén la coherencia con este contexto. No te vuelvas a presentar si ya lo hiciste. Respeta los límites establecidos. Continúa con el tono y dinámica ya establecidos.
```

### **3. HISTORIAL RECIENTE**
**Últimos 10 mensajes** de la conversación actual

**Formato**:
```json
[
  { "role": "user", "content": "Hola, ¿cómo estás?" },
  { "role": "assistant", "content": "¡Hola! Estoy muy bien, gracias por preguntar..." },
  { "role": "user", "content": "¿Qué te gusta hacer?" },
  // ... hasta 10 mensajes
]
```

### **4. MENSAJE ACTUAL DEL USUARIO**
El mensaje que el usuario acaba de enviar

---

## 🔄 **FLUJO DE CONSTRUCCIÓN**

### **Paso 1: Mapeo de Avatar**
```typescript
// backend/src/services/aiService.ts - mapAvatarIdToFileName()
const avatarMap = {
  'avatar_1': 'luna',
  'avatar_2': 'sofia', 
  'avatar_3': 'aria',
  'avatar_4': 'venus',
  'avatar_luna': 'luna',
  'avatar_sofia': 'sofia',
  'avatar_aria': 'aria',
  'avatar_venus': 'venus',
  'luna': 'luna',
  'sofia': 'sofia',
  'aria': 'aria',
  'venus': 'venus'
};
```

### **Paso 2: Lectura del Prompt**
```typescript
// backend/src/services/aiService.ts - buildSystemPrompt()
const filePath = path.join(process.cwd(), 'src', 'prompts', 'avatars', `${fileName}.txt`);
const prompt = await fs.readFile(filePath, 'utf-8');
```

### **Paso 3: Construcción de Mensajes**
```typescript
// backend/src/services/aiService.ts - buildMessages()
const messages = [
  { role: 'system', content: systemPrompt },           // 1. Prompt del sistema
  { role: 'system', content: memoryPrompt },          // 2. Memoria (si existe)
  ...conversationHistory.slice(-10),                   // 3. Historial reciente
  { role: 'user', content: userMessage }               // 4. Mensaje actual
];
```

### **Paso 4: Envío a Venice AI**
```typescript
// backend/src/services/veniceAI.ts
const payload = {
  model: 'venice-uncensored',
  messages: messages,
  max_tokens: 1000,
  temperature: 0.8,
  top_p: 0.9,
  frequency_penalty: 0.1,
  presence_penalty: 0.1
};
```

---

## 📊 **PARÁMETROS DE VENICE AI**

Los parámetros están **hardcodeados** en `backend/src/services/veniceAI.ts` (líneas 18-24):

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| **Modelo** | `venice-uncensored` | Modelo sin censura para contenido adulto |
| **Max Tokens** | `1000` | Límite de tokens por respuesta |
| **Temperatura** | `0.8` | Creatividad alta pero controlada |
| **Top P** | `0.9` | Diversidad en la selección de tokens |
| **Frequency Penalty** | `0.1` | Evita repeticiones |
| **Presence Penalty** | `0.1` | Fomenta nuevos temas |

### **Configuración de Variables de Entorno:**

```typescript
// backend/src/services/veniceAI.ts - líneas 7-9
const VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1';
const VENICE_API_KEY = process.env.VENICE_API_KEY;
const VENICE_MODEL = process.env.VENICE_MODEL || 'venice-uncensored';
```

### **Parámetros Adicionales:**

- **Timeout**: `60000` ms (60 segundos) - línea 32
- **Headers**: Authorization Bearer + Content-Type - líneas 26-29

---

## 🎯 **CARACTERÍSTICAS CLAVE**

### **✅ Personalización por Avatar**
- Cada avatar tiene su propio archivo `.txt`
- Personalidades únicas y diferenciadas
- Datos específicos de cada personaje

### **✅ Memoria Contextual**
- Se actualiza cada 10 turnos
- Mantiene coherencia en conversaciones largas
- Respeta límites y preferencias establecidas

### **✅ Historial Dinámico**
- Últimos 10 mensajes para contexto inmediato
- Evita sobrecarga de tokens
- Mantiene fluidez natural

### **✅ Instrucciones Éticas**
- Prohibición de contenido ilegal
- Respeto por límites del usuario
- Consentimiento implícito en todas las interacciones

---

## 📝 **EJEMPLO DE PROMPT COMPLETO**

```json
[
  {
    "role": "system",
    "content": "Eres una chica que trabaja en un chat sexual y erótico. Actua como un humano contestaría en un chat. Siempre frases cortas y humanizadas, sin saltos de linea. [PROMT COMPLETO DE ARIA]"
  },
  {
    "role": "system", 
    "content": "CONTEXTO DE LA CONVERSACIÓN ANTERIOR: El usuario se ha presentado como Carlos, 28 años. La conversación ha sido dulce y romántica. Tono predominante: dulce. Avatar ya se presentó: Sí. Límites discutidos: Ninguno. Fantasías exploradas: Romance, ternura."
  },
  {
    "role": "user",
    "content": "Hola, ¿cómo estás?"
  },
  {
    "role": "assistant", 
    "content": "¡Hola! Estoy muy bien, gracias por preguntar..."
  },
  {
    "role": "user",
    "content": "¿Qué te gusta hacer?"
  },
  {
    "role": "user",
    "content": "¿Cuál es tu fantasía favorita?"
  }
]
```

---

## 🔍 **ARCHIVOS RELEVANTES**

### **Servicios Principales:**
- `backend/src/services/aiService.ts` - Lógica principal de construcción de prompts
- `backend/src/services/veniceAI.ts` - Configuración y envío a Venice AI

### **Prompts de Avatares:**
- `backend/src/prompts/avatars/aria.txt` - Prompt de Aria
- `backend/src/prompts/avatars/luna.txt` - Prompt de Luna
- `backend/src/prompts/avatars/sofia.txt` - Prompt de Sofia
- `backend/src/prompts/avatars/venus.txt` - Prompt de Venus

### **Rutas de API:**
- `backend/src/routes/chat.ts` - Endpoint principal de chat

---

## ⚙️ **CONFIGURACIÓN TÉCNICA**

### **Variables de Entorno Requeridas:**
```env
VENICE_API_URL=https://api.venice.ai/api/v1
VENICE_API_KEY=tu_api_key_aqui
VENICE_MODEL=venice-uncensored
```

### **Dependencias:**
- `axios` - Para peticiones HTTP a Venice AI
- `@prisma/client` - Para consultas de base de datos
- `fs/promises` - Para lectura de archivos de prompts

---

## 🎨 **PERSONALIDADES DE AVATARES**

### **Aria** (avatar_3/avatar_aria)
- **Personalidad**: Dulce, tímida, sumisa
- **Edad**: 19 años
- **Origen**: Estudiante italiana de intercambio
- **Estilo**: Español con palabras en italiano

### **Luna** (avatar_1/avatar_luna)
- **Personalidad**: Misteriosa, seductora
- **Estilo**: Elegante y enigmática

### **Sofia** (avatar_2/avatar_sofia)
- **Personalidad**: Apasionada, sensual
- **Estilo**: Directa y atrevida

### **Venus** (avatar_4/avatar_venus)
- **Personalidad**: Dominante, experimentada
- **Edad**: 38 años
- **Contexto**: Mujer casada en portal erótico

---

## 🔒 **CONSIDERACIONES DE SEGURIDAD**

### **Validación de Contenido:**
- Prohibición de contenido ilegal
- Respeto por límites del usuario
- Moderación de contenido extremo

### **Límites Éticos:**
- No contenido con menores
- No violencia explícita
- Consentimiento implícito requerido

---

## 📈 **OPTIMIZACIONES**

### **Rendimiento:**
- Historial limitado a 10 mensajes
- Memoria contextual cada 10 turnos
- Timeout de 60 segundos

### **Calidad:**
- Prompts específicos por avatar
- Memoria contextual para coherencia
- Parámetros optimizados para creatividad

---

## 🚀 **CONCLUSIÓN**

Este sistema de prompts garantiza que cada respuesta del modelo Venice AI sea **coherente**, **personalizada** y **contextualmente apropiada** para la conversación en curso. La arquitectura modular permite fácil mantenimiento y extensión para nuevos avatares.

El sistema está diseñado para proporcionar una experiencia de chat erótico adulto de alta calidad, manteniendo siempre los estándares éticos y de seguridad requeridos. 