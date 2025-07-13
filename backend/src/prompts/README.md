# 🎭 Sistema de Prompts Refactorizado

## 📋 Descripción

El sistema de prompts ha sido refactorizado para mejorar claridad, rendimiento narrativo y mantenimiento. Se eliminó la jerarquía innecesaria y se implementó un diseño simple y eficiente de un único prompt por avatar.

## 🏗️ Nueva Arquitectura

### **Sistema de Un Solo Prompt por Avatar**
- **Ubicación**: `avatars/{avatarId}.txt`
- **Uso**: Cada avatar carga SOLO su prompt específico
- **Contenido**: Prompt completo e independiente con todas las instrucciones necesarias

## 📁 Estructura de Archivos

```
src/prompts/
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
  if (!avatarId) {
    return 'Por favor, selecciona un avatar para comenzar la conversación.';
  }

  const fileName = this.mapAvatarIdToFileName(avatarId);
  const avatarPath = path.resolve(__dirname, `../prompts/avatars/${fileName}.txt`);
  
  try {
    const avatarPrompt = await fs.readFile(avatarPath, 'utf-8');
    return avatarPrompt.trim();
  } catch (err) {
    console.warn(`[buildSystemPrompt] Avatar prompt not found for: ${avatarId}`);
    return 'Por favor, selecciona un avatar válido para comenzar la conversación.';
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
const prompt = await buildSystemPrompt(); // Mensaje de error
```

### Con Avatar
```typescript
const prompt = await buildSystemPrompt('luna'); // Solo Luna
```

## 🔄 Migración

El sistema anterior usaba:
- 3 niveles de prompts (general, básico, completo)
- Prompt base global + prompts específicos
- Concatenación de prompts
- Prompts extensos y repetitivos

El nuevo sistema:
- Un único prompt por avatar
- Prompts completos e independientes
- Sin concatenación ni prompt base
- Sistema más simple y directo

## 📊 Estadísticas

- **Prompts de avatar**: ~1,500-2,000 caracteres (completos)
- **Sin prompt base**: Eliminado
- **Sin concatenación**: Cada avatar es independiente
- **Reducción de complejidad**: ~80% 