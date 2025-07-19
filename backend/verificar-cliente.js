import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(__dirname, 'prisma', 'dev.db')}`
    }
  }
});

async function verificarCliente() {
  try {
    console.log('🔍 Verificando datos del cliente...\n');
    
    // 1. Verificar usuarios
    const users = await prisma.user.findMany({
      include: {
        tokens: true,
        sessions: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    
    console.log(`📊 Usuarios encontrados (${users.length}):`);
    users.forEach(user => {
      console.log(`\n👤 Usuario: ${user.email}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Username: ${user.username}`);
      console.log(`   - Creado: ${user.createdAt}`);
      console.log(`   - Actualizado: ${user.updatedAt}`);
      
      // Tokens del usuario
      if (user.tokens.length > 0) {
        console.log(`   - Tokens: ${user.tokens[0].amount} disponibles`);
      } else {
        console.log(`   - Tokens: NO TIENE TOKENS`);
      }
      
      // Sesiones del usuario
      console.log(`   - Sesiones activas: ${user.sessions.length}`);
      user.sessions.forEach(session => {
        console.log(`     * Token: ${session.token.substring(0, 20)}...`);
        console.log(`     * Expira: ${session.expiresAt}`);
        console.log(`     * Activa: ${new Date() < session.expiresAt ? 'SÍ' : 'NO'}`);
      });
      
      // Mensajes del usuario
      console.log(`   - Mensajes: ${user.messages.length} recientes`);
      user.messages.forEach(msg => {
        console.log(`     * ${msg.isUser ? 'Usuario' : 'IA'}: "${msg.content.substring(0, 30)}..."`);
        console.log(`       Avatar: ${msg.avatarId || 'Sin avatar'}`);
        console.log(`       Fecha: ${msg.createdAt}`);
      });
    });
    
    // 2. Verificar sesiones expiradas
    const now = new Date();
    const expiredSessions = await prisma.session.findMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });
    
    console.log(`\n⏰ Sesiones expiradas (${expiredSessions.length}):`);
    expiredSessions.forEach(session => {
      console.log(`   - Usuario: ${session.userId}`);
      console.log(`   - Expiró: ${session.expiresAt}`);
    });
    
    // 3. Verificar tokens
    const tokens = await prisma.token.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`\n💰 Tokens por usuario:`);
    tokens.forEach(token => {
      console.log(`   - ${token.user.email}: ${token.amount} tokens`);
    });
    
    // 4. Verificar mensajes con userId inválido
    const allMessages = await prisma.message.findMany({
      include: {
        user: true
      }
    });
    
    const invalidUserMessages = allMessages.filter(msg => !msg.user);
    console.log(`\n⚠️ Mensajes con userId inválido (${invalidUserMessages.length}):`);
    invalidUserMessages.forEach(msg => {
      console.log(`   - UserId: ${msg.userId}`);
      console.log(`   - Contenido: "${msg.content.substring(0, 30)}..."`);
    });
    
    // 6. Verificar autenticación JWT
    console.log(`\n🔐 Verificación de autenticación:`);
    console.log(`   - JWT_SECRET configurado: ${process.env.JWT_SECRET ? 'SÍ' : 'NO'}`);
    console.log(`   - JWT_SECRET valor: ${process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'NO CONFIGURADO'}`);
    
    // 7. Verificar configuración del servidor
    console.log(`\n⚙️ Configuración del servidor:`);
    console.log(`   - PORT: ${process.env.PORT || 'NO CONFIGURADO'}`);
    console.log(`   - HOST: ${process.env.HOST || 'NO CONFIGURADO'}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NO CONFIGURADO'}`);
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
}

verificarCliente()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 