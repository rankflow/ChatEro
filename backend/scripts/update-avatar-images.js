const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Función para encontrar la imagen disponible
function findAvailableImage(avatarName, imageType) {
  const avatarDir = path.join(__dirname, '../../frontend/public/avatars', avatarName.toLowerCase());
  const formats = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
  
  for (const format of formats) {
    const imagePath = path.join(avatarDir, `${imageType}.${format}`);
    if (fs.existsSync(imagePath)) {
      return `/avatars/${avatarName.toLowerCase()}/${imageType}.${format}`;
    }
  }
  
  // Si no encuentra ninguna imagen, devolver null
  return null;
}

async function updateAvatarImages() {
  try {
    console.log('🔄 Actualizando URLs de imágenes de avatares (buscando cualquier formato)...');
    
    const avatars = ['Aria', 'Luna', 'Sofia', 'Venus'];
    const imageTypes = ['principal', 'perfil', 'chat'];
    
    for (const avatarName of avatars) {
      console.log(`\n📸 Procesando avatar: ${avatarName}`);
      
      // Buscar el avatar existente
      const existingAvatar = await prisma.avatar.findFirst({
        where: { name: avatarName }
      });
      
      if (existingAvatar) {
        // Buscar imagen principal disponible
        const principalImageUrl = findAvailableImage(avatarName, 'principal');
        
        if (principalImageUrl) {
          // Actualizar SOLO la URL de la imagen principal
          const updatedAvatar = await prisma.avatar.update({
            where: { id: existingAvatar.id },
            data: {
              imageUrl: principalImageUrl
            }
          });
          
          console.log(`✅ Avatar ${avatarName} - URL actualizada:`, {
            id: updatedAvatar.id,
            imageUrl: updatedAvatar.imageUrl
          });
          
          // Mostrar todas las imágenes encontradas para este avatar
          console.log(`   📁 Imágenes encontradas para ${avatarName}:`);
          for (const imageType of imageTypes) {
            const imageUrl = findAvailableImage(avatarName, imageType);
            if (imageUrl) {
              console.log(`   - ${imageType}: ${imageUrl}`);
            } else {
              console.log(`   - ${imageType}: ❌ No encontrada`);
            }
          }
        } else {
          console.log(`⚠️  No se encontró imagen principal para ${avatarName}`);
        }
      } else {
        console.log(`⚠️  Avatar ${avatarName} no encontrado en la base de datos`);
      }
    }
    
    console.log('\n🎉 ¡URLs de imágenes actualizadas!');
    
    // Mostrar todos los avatares con sus URLs
    const allAvatars = await prisma.avatar.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 URLs de imágenes actuales:');
    allAvatars.forEach(avatar => {
      console.log(`- ${avatar.name}: ${avatar.imageUrl}`);
    });
    
  } catch (error) {
    console.error('❌ Error actualizando URLs de imágenes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
updateAvatarImages(); 