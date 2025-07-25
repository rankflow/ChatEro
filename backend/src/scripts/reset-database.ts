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

    // 4. Poblar categorías de memoria
    console.log('\n🌱 Poblando categorías de memoria...');
    
    // Categorías madre
    const parentCategories = [
      { id: 1, name: 'gustos', description: 'Preferencias y gustos generales' },
      { id: 2, name: 'sexualidad', description: 'Preferencias y comportamientos íntimos' },
      { id: 3, name: 'relaciones', description: 'Dinámicas afectivas y roles' },
      { id: 4, name: 'historia_personal', description: 'Experiencias personales y valores' },
      { id: 5, name: 'emociones', description: 'Estados emocionales' },
      { id: 6, name: 'cualidades_personales', description: 'Rasgos de personalidad' },
      { id: 7, name: 'anecdotas', description: 'Historias y experiencias' },
      { id: 8, name: 'otros', description: 'Otras categorías' }
    ];

    // Subcategorías de gustos
    const gustosSubcategories = [
      { id: 11, name: 'musica', description: 'Preferencias musicales', parentId: 1 },
      { id: 12, name: 'comida', description: 'Preferencias gastronómicas', parentId: 1 },
      { id: 13, name: 'deportes', description: 'Deportes favoritos', parentId: 1 },
      { id: 14, name: 'cine_series', description: 'Preferencias audiovisuales', parentId: 1 },
      { id: 15, name: 'literatura', description: 'Gustos literarios', parentId: 1 },
      { id: 16, name: 'videojuegos', description: 'Juegos favoritos', parentId: 1 },
      { id: 17, name: 'moda', description: 'Estilo y vestimenta', parentId: 1 },
      { id: 18, name: 'actividades', description: 'Actividades recreativas', parentId: 1 },
      { id: 19, name: 'otros_gustos', description: 'Otros gustos', parentId: 1 }
    ];

    // Subcategorías de sexualidad
    const sexualidadSubcategories = [
      { id: 21, name: 'zona_placer', description: 'Zonas erógenas', parentId: 2 },
      { id: 22, name: 'estilo_favorito', description: 'Estilos sexuales', parentId: 2 },
      { id: 23, name: 'lenguaje_erotico', description: 'Comunicación íntima', parentId: 2 },
      { id: 24, name: 'fantasias', description: 'Fantasías sexuales', parentId: 2 },
      { id: 25, name: 'fetiches', description: 'Fetiches específicos', parentId: 2 },
      { id: 26, name: 'rituales_sexuales', description: 'Rituales y costumbres', parentId: 2 },
      { id: 27, name: 'tabues', description: 'Límites y tabúes', parentId: 2 }
    ];

    // Subcategorías de relaciones
    const relacionesSubcategories = [
      { id: 31, name: 'nicknames', description: 'Apodos y nombres cariñosos', parentId: 3 },
      { id: 32, name: 'dinámicas_afectivas', description: 'Patrones relacionales', parentId: 3 },
      { id: 33, name: 'roles_relacionales', description: 'Roles en la relación', parentId: 3 }
    ];

    // Subcategorías de historia personal
    const historiaSubcategories = [
      { id: 41, name: 'traumas', description: 'Experiencias traumáticas', parentId: 4 },
      { id: 42, name: 'miedos', description: 'Miedos y fobias', parentId: 4 },
      { id: 43, name: 'afiliaciones', description: 'Pertenencia a grupos', parentId: 4 },
      { id: 44, name: 'valores', description: 'Valores personales', parentId: 4 },
      { id: 45, name: 'historia_familiar', description: 'Contexto familiar', parentId: 4 },
      { id: 46, name: 'logros_personales', description: 'Éxitos y logros', parentId: 4 },
      { id: 47, name: 'líneas_de_tiempo', description: 'Cronología personal', parentId: 4 }
    ];

    // Insertar categorías madre
    console.log('📝 Insertando categorías madre...');
    for (const category of parentCategories) {
      await prisma.memoryCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }

    // Insertar subcategorías
    console.log('📝 Insertando subcategorías de gustos...');
    for (const category of gustosSubcategories) {
      await prisma.memoryCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }

    console.log('📝 Insertando subcategorías de sexualidad...');
    for (const category of sexualidadSubcategories) {
      await prisma.memoryCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }

    console.log('📝 Insertando subcategorías de relaciones...');
    for (const category of relacionesSubcategories) {
      await prisma.memoryCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }

    console.log('📝 Insertando subcategorías de historia personal...');
    for (const category of historiaSubcategories) {
      await prisma.memoryCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }

    // Verificar categorías creadas
    const totalCategories = await prisma.memoryCategory.count();
    const parentCategoriesCount = await prisma.memoryCategory.count({
      where: { parentId: null }
    });
    const childCategoriesCount = await prisma.memoryCategory.count({
      where: { parentId: { not: null } }
    });

    console.log(`✅ Categorías de memoria: ${totalCategories} (${parentCategoriesCount} madre, ${childCategoriesCount} subcategorías)`);

    // 5. Verificar datos creados
    console.log('\n📊 Verificando datos creados...');
    const userCount = await prisma.user.count();
    const avatarCount = await prisma.avatar.count();
    
    console.log(`👥 Usuarios: ${userCount}`);
    console.log(`🤖 Avatares: ${avatarCount}`);

    // 6. Mostrar detalles de avatares creados
    const avatars = await prisma.avatar.findMany();
    console.log('\n📋 Avatares disponibles:');
    avatars.forEach(avatar => {
      console.log(`  • ${avatar.name} (${avatar.age} años) - ${avatar.occupation}`);
    });

    // 7. Mostrar estructura de categorías
    console.log('\n🌳 Estructura de categorías de memoria:');
    const categories = await prisma.memoryCategory.findMany({
      include: {
        children: true
      },
      where: { parentId: null },
      orderBy: { id: 'asc' }
    });

    for (const category of categories) {
      console.log(`   ${category.name} (${category.children.length} subcategorías)`);
      for (const child of category.children) {
        console.log(`     └─ ${child.name}`);
      }
    }

    console.log('\n🎉 ¡Reseteo completado exitosamente!');
    console.log('✅ Base de datos lista para desarrollo');
    console.log('✅ Tablas de memoria disponibles');
    console.log('✅ Categorías de memoria pobladas');
    console.log('✅ Usuario de prueba: test@example.com');
    console.log('✅ Avatares cargados desde archivos JSON');

  } catch (error) {
    console.error('❌ Error durante el reseteo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase(); 