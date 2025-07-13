# 🎭 Sistema de Prompts Refactorizado

## 📋 Descripción

El sistema de prompts ha sido refactorizado para mejorar claridad, rendimiento narrativo y mantenimiento. Se eliminó la jerarquía innecesaria de 3 niveles y se implementó un diseño más funcional de 2 niveles.

## 🏗️ Nueva Arquitectura

### **Nivel 1: Prompt Base Global**
- **Archivo**: `promptBase.txt`
- **Uso**: Común a todos los chats (con o sin avatar)
- **Contenido**: Comportamiento erótico, tono, límites legales, interpretación contextual del consentimiento

### **Nivel 2: Prompt Ligero por Avatar**
- **Ubicación**: `avatars/{avatarId}.txt`
- **Uso**: Solo si hay avatar seleccionado
- **Contenido**: Campos clave (nombre, edad opcional, personalidad, descripción física, backstory breve)

## 📁 Estructura de Archivos

```
src/prompts/
├── promptBase.txt          # Prompt base global
├── README.md              # Esta documentación
└── avatars/               # Prompts específicos por avatar
    ├── luna.txt           # Luna - Misteriosa y seductora
    ├── sofia.txt          # Sofia - Apasionada y sensual
    ├── aria.txt           # Aria - Dulce y sumisa
    └── venus.txt          # Venus - Dominante y poderosa
```

## 🔧 Implementación

### Método `buildSystemPrompt()`

```typescript
private static async buildSystemPrompt(avatarId?: string): Promise<string> {
  const basePath = path.resolve(__dirname, '../prompts/promptBase.txt');
  const basePrompt = await fs.readFile(basePath, 'utf-8');

  if (!avatarId) return basePrompt;

  const avatarPath = path.resolve(__dirname, `../prompts/avatars/${avatarId}.txt`);
  try {
    const avatarPrompt = await fs.readFile(avatarPath, 'utf-8');
    return `${basePrompt.trim()}\n\n${avatarPrompt.trim()}`;
  } catch (err) {
    console.warn(`[buildSystemPrompt] Avatar prompt not found for: ${avatarId}`);
    return basePrompt;
  }
}
```

## 🎯 Ventajas del Nuevo Sistema

### **1. Mantenimiento Modular**
- Los prompts de avatares se pueden editar sin tocar el core
- Cada avatar tiene su propio archivo independiente
- Fácil agregar nuevos avatares

### **2. Rendimiento Mejorado**
- Prompts más ligeros y eficientes
- Eliminación de redundancias
- Mejor optimización para modelos uncensored

### **3. Claridad y Simplicidad**
- Estructura de 2 niveles en lugar de 3
- Prompts más concisos y efectivos
- Mejor separación de responsabilidades

### **4. Flexibilidad**
- Fácil modificación de prompts base
- Personalización independiente por avatar
- Sistema escalable para nuevos avatares

## 📝 Formato de Prompts de Avatar

Cada archivo de avatar debe contener:

```markdown
Eres [Nombre], [descripción breve de edad y tipo].

PERSONALIDAD: [Descripción de la personalidad]

DESCRIPCIÓN FÍSICA: [Descripción física]

BACKSTORY: [Historia breve del personaje]

ESTILO DE COMUNICACIÓN: [Cómo habla el personaje]

TEMAS FAVORITOS: [Temas de conversación preferidos]
```

## 🚀 Uso

### Sin Avatar
```typescript
const prompt = await buildSystemPrompt(); // Solo prompt base
```

### Con Avatar
```typescript
const prompt = await buildSystemPrompt('luna'); // Base + Luna
```

## 🔄 Migración

El sistema anterior usaba:
- 3 niveles de prompts (general, básico, completo)
- Prompts extensos y repetitivos
- Lógica compleja en el código

El nuevo sistema:
- 2 niveles funcionales
- Prompts ligeros y efectivos
- Archivos separados para mantenimiento modular

## 📊 Estadísticas

- **Prompt base**: ~1,052 caracteres
- **Prompts de avatar**: ~1,100-1,300 caracteres
- **Prompt final**: ~2,100-2,400 caracteres
- **Reducción de complejidad**: ~60% 