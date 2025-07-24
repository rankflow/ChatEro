import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixTestUser() {
  try {
    console.log('🔧 Arreglando usuario de prueba...\n');

    // Password simple para desarrollo
    const plainPassword = 'test123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Buscar usuario existente
    const existingUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      // Actualizar password
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Password actualizado para usuario existente');
    } else {
      // Crear nuevo usuario
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password: hashedPassword
        }
      });
      console.log('✅ Usuario de prueba creado');
    }

    console.log('\n📋 Credenciales de prueba:');
    console.log('👤 Email: test@example.com');
    console.log('👤 Username: testuser');
    console.log('🔑 Password: test123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTestUser(); 