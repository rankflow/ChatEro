# 📸 GUÍA SIMPLE: Imágenes de Avatares

## 📁 **ESTRUCTURA SIMPLE**

```
frontend/public/avatars/
├── aria/
│   ├── principal.jpg     # Tu imagen
│   ├── perfil.jpg        # Tu imagen
│   └── chat.jpg          # Tu imagen
├── luna/
│   ├── principal.jpg
│   ├── perfil.jpg
│   └── chat.jpg
├── sofia/
│   ├── principal.jpg
│   ├── perfil.jpg
│   └── chat.jpg
└── venus/
    ├── principal.jpg
    ├── perfil.jpg
    └── chat.jpg
```

## 🎯 **3 PASOS SIMPLES**

### **PASO 1: Subir imágenes**
- Coloca tus imágenes en las carpetas correspondientes
- Usa los nombres: `principal.jpg`, `perfil.jpg`, `chat.jpg`
- Cualquier formato funciona: JPG, PNG, SVG, WebP

### **PASO 2: Actualizar base de datos**
```bash
cd backend
node scripts/update-avatar-images.cjs
```

### **PASO 3: Probar**
- Ve a `http://localhost:3000/avatars`
- Verifica que las imágenes se ven correctamente

## 📏 **DIMENSIONES RECOMENDADAS**

- **principal:** 400x600px (portada)
- **perfil:** 400x600px (perfil detallado)
- **chat:** 300x400px (chat pequeño)

## 🔧 **ÚNICO SCRIPT NECESARIO**

### **update-avatar-images.cjs**
- Busca automáticamente cualquier formato (PNG, JPG, SVG, WebP)
- Actualiza las URLs en la base de datos
- No modifica descripción, personalidad, etc.

## 🎨 **ENCUADRADO MANUAL**

1. **Abre tu imagen** en tu editor favorito
2. **Recorta** a las dimensiones recomendadas
3. **Guarda** con el nombre correcto
4. **Sube** a la carpeta correspondiente
5. **Ejecuta** el script de actualización

## ✅ **LISTO**

¡Eso es todo! No más complicaciones. 