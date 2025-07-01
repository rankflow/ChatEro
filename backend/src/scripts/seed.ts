import { PrismaClient } from '@prisma/client';
import { CharacterDevelopmentService } from '../services/characterDevelopment';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar base de datos
  await prisma.message.deleteMany();
  await prisma.avatar.deleteMany();
  await prisma.token.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Base de datos limpiada');

  // Crear usuario de prueba
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'testuser',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password123
    },
  });

  console.log('✅ Usuario de prueba creado');

  // Crear tokens para el usuario
  await prisma.token.create({
    data: {
      userId: testUser.id,
      amount: 1000,
    },
  });

  console.log('✅ Tokens creados');

  // Definir avatares con perfiles completos
  const avatarProfiles = [
    {
      name: 'Luna',
      basePersonality: 'Misteriosa, seductora, inteligente',
      category: 'misteriosa',
      isPremium: false,
    },
    {
      name: 'Sofia',
      basePersonality: 'Madura, experimentada, dominante',
      category: 'madura',
      isPremium: true,
    },
    {
      name: 'Aria',
      basePersonality: 'Juguetona, inocente, curiosa',
      category: 'joven',
      isPremium: false,
    },
    {
      name: 'Venus',
      basePersonality: 'Elegante, sofisticada, apasionada',
      category: 'elegante',
      isPremium: true,
    },
    {
      name: 'Nova',
      basePersonality: 'Rebelde, aventurera, independiente',
      category: 'joven',
      isPremium: false,
    },
    {
      name: 'Maya',
      basePersonality: 'Sabia, espiritual, comprensiva',
      category: 'madura',
      isPremium: true,
    },
  ];

  console.log('🎭 Generando perfiles de personajes...');

  // Crear avatares con perfiles completos
  for (const profile of avatarProfiles) {
    try {
      // Generar perfil completo usando IA
      const characterProfile = await CharacterDevelopmentService.generateCharacterProfile(
        profile.name,
        profile.basePersonality,
        profile.category
      );

      // Generar descripción mejorada
      const enhancedDescription = await CharacterDevelopmentService.generateEnhancedDescription(characterProfile);

      // Crear avatar en la base de datos
      await prisma.avatar.create({
        data: {
          id: `avatar_${profile.name.toLowerCase()}`,
          name: characterProfile.name,
          description: enhancedDescription,
          personality: characterProfile.personality,
          imageUrl: `/api/avatars/avatar_${profile.name.toLowerCase()}/image`,
          isPremium: profile.isPremium,
          category: profile.category,
          isActive: true,
          
          // Datos del desarrollo creativo
          background: characterProfile.background,
          origin: characterProfile.origin,
          age: characterProfile.age,
          occupation: characterProfile.occupation,
          interests: characterProfile.interests,
          fears: characterProfile.fears,
          dreams: characterProfile.dreams,
          secrets: characterProfile.secrets,
          relationships: characterProfile.relationships,
          lifeExperiences: characterProfile.lifeExperiences,
          personalityTraits: characterProfile.personalityTraits,
          communicationStyle: characterProfile.communicationStyle,
          emotionalState: characterProfile.emotionalState,
          motivations: characterProfile.motivations,
          conflicts: characterProfile.conflicts,
          growth: characterProfile.growth,
          voiceType: characterProfile.voiceType,
          accent: characterProfile.accent,
          mannerisms: characterProfile.mannerisms,
          style: characterProfile.style,
          scent: characterProfile.scent,
          chatStyle: characterProfile.chatStyle,
          topics: characterProfile.topics,
          boundaries: characterProfile.boundaries,
          kinks: characterProfile.kinks,
          roleplay: characterProfile.roleplay,
        },
      });

      console.log(`✅ Avatar ${profile.name} creado con perfil completo`);
    } catch (error) {
      console.error(`❌ Error creando avatar ${profile.name}:`, error);
      
      // Crear avatar con datos por defecto si falla la IA
      await prisma.avatar.create({
        data: {
          id: `avatar_${profile.name.toLowerCase()}`,
          name: profile.name,
          description: `${profile.name} es un personaje atractivo con personalidad ${profile.basePersonality}.`,
          personality: profile.basePersonality,
          imageUrl: `/api/avatars/avatar_${profile.name.toLowerCase()}/image`,
          isPremium: profile.isPremium,
          category: profile.category,
          isActive: true,
        },
      });
      
      console.log(`✅ Avatar ${profile.name} creado con datos por defecto`);
    }
  }

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