import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface AvatarData {
  name: string;
  age: number;
  occupation: string;
  origin: string;
  background: string;
  personalityTraits: string;
  interests: string;
  fears: string;
  dreams: string;
  secrets: string;
  relationships: string;
  lifeExperiences: string;
  communicationStyle: string;
  emotionalState: string;
  motivations: string;
  conflicts: string;
  growth: string;
  voiceType: string;
  accent: string;
  mannerisms: string;
  style: string;
  scent: string;
  chatStyle: string;
  topics: string;
  boundaries: string;
  kinks: string;
  roleplay: string;
}

async function resetDatabase() {
  try {
    console.log('🔄 Iniciando reseteo de base de datos...\n');

    // 1. Limpiar todas las tablas
    console.log('🧹 Limpiando tablas existentes...');
    await prisma.userMemory.deleteMany();
    await prisma.conversationEmbedding.deleteMany();
    await prisma.memoryCluster.deleteMany();
    await prisma.sessionSummary.deleteMany();
    await prisma.message.deleteMany();
    await prisma.session.deleteMany();
    await prisma.token.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.avatar.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Tablas limpiadas');

    // 2. Crear usuario de prueba
    console.log('\n👤 Creando usuario de prueba...');
    
    // Password simple para desarrollo
    const plainPassword = 'test123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword
      }
    });
    console.log(`✅ Usuario creado: ${testUser.username} (${testUser.email})`);
    console.log('🔑 Password: test123');

    // 3. Cargar datos de avatares desde archivos JSON
    console.log('\n🤖 Cargando avatares desde archivos JSON...');
    
    const avatarsDir = path.join(process.cwd(), 'src/prompts/avatars/extended');
    const avatarFiles = ['aria_extended.json', 'luna_extended.json', 'sofia_extended.json', 'venus_extended.json'];
    
    for (const file of avatarFiles) {
      const filePath = path.join(avatarsDir, file);
      
      if (fs.existsSync(filePath)) {
        const avatarData: AvatarData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Crear avatar con datos extendidos
        const avatar = await prisma.avatar.create({
          data: {
            name: avatarData.name,
            description: `${avatarData.name} - ${avatarData.occupation} de ${avatarData.origin}`,
            personality: avatarData.personalityTraits,
            imageUrl: `/avatars/${avatarData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}/principal.png`,
            isPremium: false,
            category: 'romantic',
            isActive: true,
            background: avatarData.background,
            origin: avatarData.origin,
            age: avatarData.age,
            occupation: avatarData.occupation,
            interests: avatarData.interests,
            fears: avatarData.fears,
            dreams: avatarData.dreams,
            secrets: avatarData.secrets,
            relationships: avatarData.relationships,
            lifeExperiences: avatarData.lifeExperiences,
            personalityTraits: avatarData.personalityTraits,
            communicationStyle: avatarData.communicationStyle,
            emotionalState: avatarData.emotionalState,
            motivations: avatarData.motivations,
            conflicts: avatarData.conflicts,
            growth: avatarData.growth,
            voiceType: avatarData.voiceType,
            accent: avatarData.accent,
            mannerisms: avatarData.mannerisms,
            style: avatarData.style,
            scent: avatarData.scent,
            chatStyle: avatarData.chatStyle,
            topics: avatarData.topics,
            boundaries: avatarData.boundaries,
            kinks: avatarData.kinks,
            roleplay: avatarData.roleplay
          }
        });
        
        console.log(`✅ Avatar creado: ${avatar.name} (${avatar.occupation})`);
      } else {
        console.log(`⚠️ Archivo no encontrado: ${file}`);
      }
    }

    // 4. Verificar datos creados
    console.log('\n📊 Verificando datos creados...');
    const userCount = await prisma.user.count();
    const avatarCount = await prisma.avatar.count();
    
    console.log(`👥 Usuarios: ${userCount}`);
    console.log(`🤖 Avatares: ${avatarCount}`);

    // 5. Mostrar detalles de avatares creados
    const avatars = await prisma.avatar.findMany();
    console.log('\n📋 Avatares disponibles:');
    avatars.forEach(avatar => {
      console.log(`  • ${avatar.name} (${avatar.age} años) - ${avatar.occupation}`);
    });

    console.log('\n🎉 ¡Reseteo completado exitosamente!');
    console.log('✅ Base de datos lista para desarrollo');
    console.log('✅ Tablas de memoria disponibles');
    console.log('✅ Usuario de prueba: test@example.com');
    console.log('✅ Avatares cargados desde archivos JSON');

  } catch (error) {
    console.error('❌ Error durante el reseteo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase(); 