import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSimple() {
  try {
    console.log('🧪 Prueba simple de conexión...\n');

    // Probar conexión básica
    const userCount = await prisma.user.count();
    const avatarCount = await prisma.avatar.count();
    
    console.log(`👥 Usuarios: ${userCount}`);
    console.log(`🤖 Avatares: ${avatarCount}`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({ take: 1 });
      console.log(`👤 Primer usuario: ${users[0].username}`);
    }

    if (avatarCount > 0) {
      const avatars = await prisma.avatar.findMany({ take: 1 });
      console.log(`🤖 Primer avatar: ${avatars[0].name}`);
    }

    console.log('\n✅ Conexión exitosa');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimple(); 