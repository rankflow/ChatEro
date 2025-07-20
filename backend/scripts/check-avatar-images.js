const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkAvatarImages() {
  try {
    console.log('🔍 Verificando imágenes de avatares con nueva estructura...');
    
    // Obtener todos los avatares de la base de datos
    const avatars = await prisma.avatar.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    console.log(`\n📊 Avatares encontrados: ${avatars.length}`);
    
    for (const avatar of avatars) {
      console.log(`\n👤 Avatar: ${avatar.name}`);
      console.log(`   ID: ${avatar.id}`);
      console.log(`   URL de imagen principal: ${avatar.imageUrl}`);
      console.log(`   Categoría: ${avatar.category}`);
      console.log(`   Premium: ${avatar.isPremium ? 'Sí' : 'No'}`);
      console.log(`   Activo: ${avatar.isActive ? 'Sí' : 'No'}`);
      
      // Verificar si la imagen principal existe
      const imagePath = path.join(__dirname, '../../frontend/public', avatar.imageUrl);
      const imageExists = fs.existsSync(imagePath);
      
      console.log(`   📁 Imagen principal existe: ${imageExists ? '✅ Sí' : '❌ No'}`);
      
      if (!imageExists) {
        console.log(`   ⚠️  Ruta esperada: ${imagePath}`);
      }
      
      // Verificar otras imágenes del avatar
      const avatarFolder = path.dirname(imagePath);
      const avatarName = avatar.name.toLowerCase();
      
      const expectedImages = [
        'principal.jpg',
        'perfil.jpg', 
        'chat.jpg'
      ];
      
      console.log(`   📂 Verificando carpeta: ${avatarFolder}`);
      
      if (fs.existsSync(avatarFolder)) {
        const files = fs.readdirSync(avatarFolder);
        console.log(`   Archivos en carpeta: ${files.length}`);
        
        expectedImages.forEach(expectedImage => {
          const imageExists = files.includes(expectedImage);
          console.log(`   - ${expectedImage}: ${imageExists ? '✅' : '❌'}`);
        });
        
        // Verificar carpeta de galería
        const galleryPath = path.join(avatarFolder, 'galeria');
        if (fs.existsSync(galleryPath)) {
          const galleryFiles = fs.readdirSync(galleryPath);
          console.log(`   - Galería: ${galleryFiles.length} imágenes`);
        } else {
          console.log(`   - Galería: ❌ No existe`);
        }
      } else {
        console.log(`   ❌ Carpeta del avatar no existe`);
      }
    }
    
    // Verificar estructura general de carpetas
    const avatarsDir = path.join(__dirname, '../../frontend/public/avatars');
    console.log(`\n📁 Verificando estructura general: ${avatarsDir}`);
    
    if (fs.existsSync(avatarsDir)) {
      const avatarFolders = fs.readdirSync(avatarsDir);
      console.log(`   Carpetas de avatares: ${avatarFolders.length}`);
      avatarFolders.forEach(folder => {
        console.log(`   - ${folder}/`);
      });
    } else {
      console.log('   ❌ Carpeta de avatares no existe');
    }
    
    console.log('\n📋 Resumen:');
    console.log(`- Avatares en BD: ${avatars.length}`);
    console.log(`- Imágenes principales esperadas: ${avatars.filter(a => a.imageUrl).length}`);
    
  } catch (error) {
    console.error('❌ Error verificando imágenes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
checkAvatarImages(); 