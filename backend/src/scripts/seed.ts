import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios de prueba
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      username: 'demouser',
      password: hashedPassword,
    },
  });

  console.log('✅ Usuarios creados:', { user1: user1.username, user2: user2.username });

  // Crear tokens para los usuarios
  await prisma.token.create({
    data: {
      userId: user1.id,
      amount: 100,
    },
  });

  await prisma.token.create({
    data: {
      userId: user2.id,
      amount: 50,
    },
  });

  console.log('✅ Tokens creados');

  // Crear avatares
  const avatars = [
    {
      id: 'avatar_1',
      name: 'Luna',
      description: 'Una chica misteriosa y seductora con un aura de enigma que te cautivará',
      personality: 'Misteriosa, seductora, inteligente',
      imageUrl: '/api/avatars/avatar_1/image',
      isPremium: false,
      category: 'misteriosa',
      isActive: true,
    },
    {
      id: 'avatar_2',
      name: 'Sofia',
      description: 'Una mujer madura y experimentada que sabe exactamente lo que quiere',
      personality: 'Madura, experimentada, dominante',
      imageUrl: '/api/avatars/avatar_2/image',
      isPremium: true,
      category: 'madura',
      isActive: true,
    },
    {
      id: 'avatar_3',
      name: 'Aria',
      description: 'Una chica joven y juguetona que te hará sonreír con su energía',
      personality: 'Juguetona, inocente, curiosa',
      imageUrl: '/api/avatars/avatar_3/image',
      isPremium: false,
      category: 'joven',
      isActive: true,
    },
    {
      id: 'avatar_4',
      name: 'Venus',
      description: 'Una diosa de la belleza y el amor que te envolverá en su elegancia',
      personality: 'Elegante, sofisticada, apasionada',
      imageUrl: '/api/avatars/avatar_4/image',
      isPremium: true,
      category: 'elegante',
      isActive: true,
    },
    {
      id: 'avatar_5',
      name: 'Nova',
      description: 'Una chica rebelde y aventurera que te llevará a lugares inesperados',
      personality: 'Rebelde, aventurera, independiente',
      imageUrl: '/api/avatars/avatar_5/image',
      isPremium: false,
      category: 'joven',
      isActive: true,
    },
    {
      id: 'avatar_6',
      name: 'Maya',
      description: 'Una mujer sabia y espiritual que te conectará con tu ser interior',
      personality: 'Sabia, espiritual, comprensiva',
      imageUrl: '/api/avatars/avatar_6/image',
      isPremium: true,
      category: 'madura',
      isActive: true,
    },
  ];

  for (const avatar of avatars) {
    await prisma.avatar.upsert({
      where: { id: avatar.id },
      update: {},
      create: avatar,
    });
  }

  console.log('✅ Avatares creados:', avatars.length);

  // Crear algunos mensajes de ejemplo
  const sampleMessages = [
    {
      userId: user1.id,
      content: 'Hola, ¿cómo estás?',
      isUser: true,
      avatarId: 'avatar_1',
      tokensUsed: 0,
    },
    {
      userId: user1.id,
      content: '¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      avatarId: 'avatar_1',
      tokensUsed: 15,
    },
    {
      userId: user1.id,
      content: 'Me gustaría conocer más sobre ti',
      isUser: true,
      avatarId: 'avatar_1',
      tokensUsed: 0,
    },
    {
      userId: user1.id,
      content: 'Me encantaría contarte más sobre mí. Soy Luna, una chica misteriosa que adora las conversaciones profundas y las conexiones auténticas. ¿Qué te gustaría saber?',
      isUser: false,
      avatarId: 'avatar_1',
      tokensUsed: 25,
    },
  ];

  for (const message of sampleMessages) {
    await prisma.message.create({
      data: message,
    });
  }

  console.log('✅ Mensajes de ejemplo creados:', sampleMessages.length);

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 