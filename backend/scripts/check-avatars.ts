import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAvatars() {
  try {
    console.log('🔍 Verificando avatares en la base de datos...');
    
    const avatars = await prisma.avatar.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true
      }
    });
    
    console.log(`📊 Total de avatares encontrados: ${avatars.length}`);
    
    for (const avatar of avatars) {
      console.log(`- ${avatar.name} (ID: ${avatar.id}, Activo: ${avatar.isActive})`);
    }
    
    if (avatars.length === 0) {
      console.log('❌ No hay avatares en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error verificando avatares:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAvatars(); 