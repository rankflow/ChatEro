const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearSessions() {
  try {
    console.log('🧹 Limpiando sesiones...\n');
    
    // Eliminar todas las sesiones
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ ${deletedSessions.count} sesiones eliminadas`);
    
    // Verificar usuarios actuales
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true }
    });
    
    console.log('\n👥 Usuarios disponibles para login:');
    users.forEach(user => {
      console.log(`  - Email: ${user.email}, Username: ${user.username}, ID: ${user.id}`);
    });
    
    console.log('\n📝 Para hacer login, usa:');
    console.log('  Email: test@example.com');
    console.log('  Password: test123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearSessions(); 