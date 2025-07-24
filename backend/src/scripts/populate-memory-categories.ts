import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateMemoryCategories() {
  try {
    console.log('🌱 Poblando categorías de memoria...');

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

    // Verificar inserción
    const totalCategories = await prisma.memoryCategory.count();
    const parentCategoriesCount = await prisma.memoryCategory.count({
      where: { parentId: null }
    });
    const childCategoriesCount = await prisma.memoryCategory.count({
      where: { parentId: { not: null } }
    });

    console.log('✅ Categorías pobladas exitosamente:');
    console.log(`   - Total: ${totalCategories}`);
    console.log(`   - Categorías madre: ${parentCategoriesCount}`);
    console.log(`   - Subcategorías: ${childCategoriesCount}`);

    // Mostrar estructura jerárquica
    console.log('\n🌳 Estructura jerárquica:');
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

  } catch (error) {
    console.error('❌ Error poblando categorías:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
populateMemoryCategories()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en script:', error);
    process.exit(1);
  }); 