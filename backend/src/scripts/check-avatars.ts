import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAvatars() {
  try {
    console.log('🔍 Verificando avatares en la base de datos...\n');
    
    // Buscar el avatar específico que está causando problemas
    const specificAvatar = await prisma.avatar.findUnique({
      where: { id: 'cmdhqeh720001rka7bifkgpo8' }
    });
    
    console.log('1️⃣ Avatar específico (cmdhqeh720001rka7bifkgpo8):');
    console.log(specificAvatar ? `✅ Encontrado: ${specificAvatar.name}` : '❌ NO ENCONTRADO');
    
    // Listar todos los avatares
    const allAvatars = await prisma.avatar.findMany({
      select: { id: true, name: true, isActive: true }
    });
    
    console.log('\n2️⃣ Todos los avatares en la base de datos:');
    if (allAvatars.length === 0) {
      console.log('❌ No hay avatares en la base de datos');
    } else {
      allAvatars.forEach((avatar, index) => {
        console.log(`${index + 1}. ID: ${avatar.id} | Nombre: ${avatar.name} | Activo: ${avatar.isActive}`);
      });
    }
    
    // Verificar usuario de prueba
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    console.log('\n3️⃣ Usuario de prueba:');
    console.log(testUser ? `✅ Encontrado: ${testUser.email}` : '❌ NO ENCONTRADO');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAvatars(); 