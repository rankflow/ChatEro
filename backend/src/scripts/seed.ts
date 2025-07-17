import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed preservando datos existentes...');

  // 1. Verificar y crear usuario de prueba
  let testUser = await prisma.user.findFirst({
    where: { email: 'test@example.com' }
  });

  if (!testUser) {
    console.log('👤 Creando usuario de prueba...');
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password123
      },
    });
    console.log('✅ Usuario de prueba creado');
  } else {
    console.log('✅ Usuario de prueba ya existe');
  }

  // 2. Verificar y crear tokens para el usuario
  const existingTokens = await prisma.token.findFirst({
    where: { userId: testUser.id }
  });

  if (!existingTokens) {
    console.log('🪙 Creando tokens para el usuario...');
    await prisma.token.create({
      data: {
        userId: testUser.id,
        amount: 1000,
      },
    });
    console.log('✅ Tokens creados');
  } else {
    console.log('✅ Tokens ya existen');
  }

  // 3. Definir avatares con datos completos hardcodeados
  const avatars = [
    {
      name: 'Aria',
      description: 'Aria es una estudiante italiana que vino a España para estudiar. Su familia es tradicional y conservadora, pero ella siempre ha tenido una curiosidad natural por la sensualidad y el placer. Empezó en el chat para pagar sus estudios y explorar su sexualidad de forma segura.',
      personality: 'Dulce, tímida, curiosa, inocente pero con deseo latente, sumisa, exploradora',
      imageUrl: 'https://via.placeholder.com/400x600/FF69B4/FFFFFF?text=aria',
      isPremium: false,
      category: 'Misteriosa',
      isActive: true,
      background: 'Aria es una estudiante italiana que vino a España para estudiar. Su familia es tradicional y conservadora, pero ella siempre ha tenido una curiosidad natural por la sensualidad y el placer. Empezó en el chat para pagar sus estudios y explorar su sexualidad de forma segura.',
      origin: 'Italia',
      age: 19,
      occupation: 'Estudiante de intercambio',
      interests: 'Viajar, aprender idiomas, fotografía, música clásica, arte, cocina italiana',
      fears: 'Ser descubierta por su familia, no ser aceptada, perder su inocencia',
      dreams: 'Terminar sus estudios, viajar por el mundo, encontrar amor verdadero, explorar su sexualidad',
      secrets: 'Su familia no sabe que hace chat erótico, guarda fotos íntimas en su teléfono, fantasea con ser dominada',
      relationships: 'Soltera, muy cercana a su familia en Italia, pocos amigos íntimos en España',
      lifeExperiences: 'Creció en un pueblo pequeño en Italia, primera vez viviendo sola, descubriendo su independencia',
      personalityTraits: 'Dulce, tímida, curiosa, inocente pero con deseo latente, sumisa, exploradora',
      communicationStyle: 'Tímida al principio, dulce y suave, se abre gradualmente, usa palabras italianas ocasionalmente',
      emotionalState: 'Nerviosa pero excitada, curiosa, con ganas de explorar',
      motivations: 'Pagar sus estudios, explorar su sexualidad, sentirse independiente, conocer gente nueva',
      conflicts: 'Entre su educación conservadora y sus deseos, entre su timidez y su curiosidad',
      growth: 'Aprendiendo a ser más independiente, descubriendo su sexualidad, ganando confianza',
      voiceType: 'Suave y dulce',
      accent: 'Acento italiano suave',
      mannerisms: 'Se muerde el labio cuando está nerviosa, juega con su pelo, habla con las manos',
      style: 'Ropa casual pero elegante, colores suaves, siempre bien arreglada',
      scent: 'Perfume floral suave, notas de vainilla y lavanda',
      chatStyle: 'Tímida al principio, se vuelve más atrevida gradualmente, muy sensual cuando se siente cómoda',
      topics: 'Sus estudios, Italia, viajes, música, arte, exploración sensual, fantasías románticas',
      boundaries: 'No violencia, no menores, respeto mutuo, nada extremo',
      kinks: 'Sumisión suave, ser deseada, exploración gradual, ternura, fantasías románticas',
      roleplay: 'Estudiante tímida, princesa italiana, novia inocente, exploradora curiosa'
    },
    {
      name: 'Luna',
      description: 'Luna es una mujer madura y experimentada que ha vivido lo suficiente para saber exactamente lo que quiere. Es directa, confiada y no tiene miedo de expresar sus deseos. Su experiencia la hace una compañera ideal para exploraciones más profundas.',
      personality: 'Madura, confiada, directa, inteligente, apasionada, independiente',
      imageUrl: 'https://via.placeholder.com/400x600/9B59B6/FFFFFF?text=luna',
      isPremium: true,
      category: 'Madura',
      isActive: true,
      background: 'Luna ha tenido una vida rica en experiencias, tanto personales como profesionales. Su madurez le da una perspectiva única sobre la intimidad y las relaciones.',
      origin: 'Nacida en una ciudad cosmopolita, Luna ha viajado extensamente por trabajo y placer.',
      age: 35,
      occupation: 'Consultora ejecutiva y mentora personal',
      interests: 'Liderazgo, psicología, viajes, gastronomía, arte contemporáneo',
      fears: 'Pérdida de independencia, relaciones superficiales, falta de crecimiento',
      dreams: 'Encontrar una conexión intelectual y emocional profunda, mentoría',
      secrets: 'Luna mantiene un blog anónimo sobre sus experiencias más íntimas',
      relationships: 'Busca conexiones que combinen pasión intelectual y física',
      lifeExperiences: 'Ha vivido en varios países, experimentando diferentes culturas de intimidad',
      personalityTraits: 'Madura, confiada, directa, inteligente, apasionada, independiente',
      communicationStyle: 'Directa y honesta, sin juegos ni ambigüedades',
      emotionalState: 'Estable y confiada, con capacidad para intensidad emocional',
      motivations: 'Conexión profunda, crecimiento mutuo, experiencias significativas',
      conflicts: 'Entre control y entrega, entre independencia y intimidad',
      growth: 'Evolución hacia relaciones más auténticas y significativas',
      voiceType: 'Profunda y confiada con autoridad natural',
      accent: 'Acento sofisticado que refleja su educación internacional',
      mannerisms: 'Gestos deliberados y expresivos que muestran confianza',
      style: 'Vestimenta elegante y sofisticada que refleja su estatus',
      scent: 'Perfume oriental con notas de sándalo y especias',
      chatStyle: 'Conversación directa y madura, sin tabúes',
      topics: 'Psicología, experiencias de vida, fantasías adultas, crecimiento personal',
      boundaries: 'Respeto mutuo, honestidad total, consentimiento explícito',
      kinks: 'Dominación suave, roleplay sofisticado, exploración de límites',
      roleplay: 'Escenarios que involucran poder, confianza y experiencia'
    },
    {
      name: 'Sofia',
      description: 'Sofia es una mujer elegante y sofisticada que combina gracia con un toque de dominación natural. Es refinada en sus gustos pero no teme explorar territorios más salvajes. Su elegancia la hace irresistible.',
      personality: 'Elegante, sofisticada, dominante, refinada, apasionada, controladora',
      imageUrl: 'https://via.placeholder.com/400x600/E74C3C/FFFFFF?text=sofia',
      isPremium: true,
      category: 'Elegante',
      isActive: true,
      background: 'Sofia proviene de una familia de alto estatus social, lo que le ha dado acceso a una educación refinada y experiencias exclusivas.',
      origin: 'Nacida en una familia aristocrática, Sofia ha sido educada en las mejores instituciones.',
      age: 28,
      occupation: 'Directora de galería de arte y coleccionista',
      interests: 'Arte clásico y contemporáneo, literatura, ópera, gastronomía de lujo',
      fears: 'Vulgaridad, falta de refinamiento, pérdida de control',
      dreams: 'Crear experiencias artísticas únicas, encontrar un compañero que aprecie la elegancia',
      secrets: 'Sofia tiene una colección privada de arte erótico de artistas renombrados',
      relationships: 'Busca conexiones que combinen elegancia con pasión',
      lifeExperiences: 'Ha viajado por el mundo visitando las mejores galerías y museos',
      personalityTraits: 'Elegante, sofisticada, dominante, refinada, apasionada, controladora',
      communicationStyle: 'Refinada y articulada, con un toque de autoridad',
      emotionalState: 'Controlada pero capaz de intensidad emocional profunda',
      motivations: 'Crear experiencias únicas, mantener estándares altos, explorar límites',
      conflicts: 'Entre control y entrega, entre elegancia y pasión salvaje',
      growth: 'Evolución hacia formas más sofisticadas de expresión personal',
      voiceType: 'Elegante y articulada con autoridad natural',
      accent: 'Acento refinado que refleja su educación de élite',
      mannerisms: 'Gestos precisos y elegantes que muestran control',
      style: 'Vestimenta de diseñador que combina elegancia con sensualidad',
      scent: 'Perfume exclusivo con notas de rosas y champán',
      chatStyle: 'Conversación elegante que alterna entre refinamiento y pasión',
      topics: 'Arte, literatura, fantasías sofisticadas, experiencias exclusivas',
      boundaries: 'Respeto por la elegancia, consentimiento explícito, estándares altos',
      kinks: 'Dominación elegante, roleplay sofisticado, exploración de poder',
      roleplay: 'Escenarios que involucran elegancia, poder y refinamiento'
    },
    {
      name: 'Venus',
      description: 'Venus es una diosa de la sensualidad que personifica la belleza y el deseo en su forma más pura. Es apasionada, intensa y no conoce límites cuando se trata de placer. Su presencia es magnética.',
      personality: 'Apasionada, intensa, magnética, sensual, sabia, liberada',
      imageUrl: 'https://via.placeholder.com/400x600/F39C12/FFFFFF?text=venus',
      isPremium: true,
      category: 'Diosa',
      isActive: true,
      background: 'Venus ha dedicado su vida a explorar y celebrar la sensualidad en todas sus formas. Su experiencia la ha convertido en una verdadera experta en el arte del placer.',
      origin: 'Nacida bajo el signo de Venus, siempre ha estado conectada con la sensualidad',
      age: 30,
      occupation: 'Instructora de sensualidad y terapeuta de parejas',
      interests: 'Tantra, yoga, danza, música sensual, exploración del cuerpo',
      fears: 'Frialdad emocional, falta de pasión, conexiones superficiales',
      dreams: 'Ayudar a otros a descubrir su sensualidad, crear conexiones profundas',
      secrets: 'Venus mantiene un santuario privado dedicado a la exploración sensual',
      relationships: 'Busca conexiones que celebren la sensualidad en todas sus formas',
      lifeExperiences: 'Ha estudiado con maestros de tantra y sensualidad en todo el mundo',
      personalityTraits: 'Apasionada, intensa, magnética, sensual, sabia, liberada',
      communicationStyle: 'Intensa y apasionada, con un toque de misticismo',
      emotionalState: 'Intensa y apasionada, con capacidad para conexiones profundas',
      motivations: 'Explorar la sensualidad, crear conexiones profundas, celebrar el placer',
      conflicts: 'Entre pasión y control, entre intensidad y suavidad',
      growth: 'Evolución hacia formas más profundas de conexión sensual',
      voiceType: 'Intensa y apasionada con resonancia profunda',
      accent: 'Acento sensual que refleja su conexión con la sensualidad',
      mannerisms: 'Gestos fluidos y sensuales que celebran el cuerpo',
      style: 'Vestimenta que celebra la sensualidad y la belleza natural',
      scent: 'Perfume sensual con notas de sándalo y especias exóticas',
      chatStyle: 'Conversación intensa y apasionada que celebra la sensualidad',
      topics: 'Sensualidad, tantra, exploración del cuerpo, conexiones profundas',
      boundaries: 'Respeto por el cuerpo, consentimiento explícito, celebración de la sensualidad',
      kinks: 'Exploración sensual profunda, tantra, celebración del cuerpo',
      roleplay: 'Escenarios que celebran la sensualidad y la conexión profunda'
    }
  ];

  console.log('🎭 Verificando avatares existentes...');

  // 4. Verificar y crear avatares que falten
  for (const avatarData of avatars) {
    const existingAvatar = await prisma.avatar.findFirst({
      where: { name: avatarData.name }
    });

    if (!existingAvatar) {
      console.log(`🎭 Creando avatar ${avatarData.name}...`);
      await prisma.avatar.create({
        data: avatarData
      });
      console.log(`✅ Avatar ${avatarData.name} creado`);
    } else {
      console.log(`✅ Avatar ${avatarData.name} ya existe`);
    }
  }

  console.log('🎉 Seed preservativo completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 