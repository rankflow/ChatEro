const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    const users = await prisma.user.findMany();
    console.log('📊 Usuarios encontrados:', users.length);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`👤 Usuario ${index + 1}:`, {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt
        });
      });
    } else {
      console.log('❌ No hay usuarios en la base de datos');
    }
    
    console.log('\n🔍 Verificando avatares...');
    const avatars = await prisma.avatar.findMany();
    console.log('📊 Avatares encontrados:', avatars.length);
    
    if (avatars.length > 0) {
      avatars.forEach((avatar, index) => {
        console.log(`🎭 Avatar ${index + 1}:`, {
          id: avatar.id,
          name: avatar.name,
          isActive: avatar.isActive
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 