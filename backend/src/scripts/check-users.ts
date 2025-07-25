import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');
    
    // Buscar el usuario específico que está causando problemas
    const specificUser = await prisma.user.findUnique({
      where: { id: 'cmdgaj77y0000b0cxvq7w2ydf' }
    });
    
    console.log('1️⃣ Usuario específico (cmdgaj77y0000b0cxvq7w2ydf):');
    console.log(specificUser ? `✅ Encontrado: ${specificUser.email}` : '❌ NO ENCONTRADO');
    
    // Buscar por email
    const testUserByEmail = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    console.log('\n2️⃣ Usuario por email (test@example.com):');
    console.log(testUserByEmail ? `✅ Encontrado: ID ${testUserByEmail.id}` : '❌ NO ENCONTRADO');
    
    // Listar todos los usuarios
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, username: true, createdAt: true }
    });
    
    console.log('\n3️⃣ Todos los usuarios en la base de datos:');
    if (allUsers.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id} | Email: ${user.email} | Username: ${user.username} | Creado: ${user.createdAt.toISOString()}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 