import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CharacterDevelopmentService } from '../services/characterDevelopment';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function avatarRoutes(fastify: FastifyInstance) {
  // Obtener lista de avatares disponibles
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const avatars = await prisma.avatar.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' }
      });
      return reply.send({
        success: true,
        avatars,
        total: avatars.length
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener avatares',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener avatar específico
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      // TODO: Implementar obtención desde base de datos
      const mockAvatar = {
        id,
        name: 'Avatar Personalizado',
        description: 'Un avatar único y personalizado',
        personality: 'Adaptable, inteligente, atractiva',
        imageUrl: `/api/avatars/${id}/image`,
        isPremium: false,
        category: 'personalizado',
        customization: {
          hairColor: 'variable',
          eyeColor: 'variable',
          bodyType: 'variable',
          style: 'variable'
        }
      };
      
      return reply.send({
        success: true,
        avatar: mockAvatar
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener avatar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener imagen del avatar (placeholder)
  fastify.get('/:id/image', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      // TODO: Implementar obtención de imagen real desde S3/Wasabi
      // Por ahora, redirigimos a una imagen placeholder
      
      return reply.redirect('https://via.placeholder.com/400x600/FF6B9D/FFFFFF?text=Avatar+Placeholder');
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener imagen del avatar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener categorías de avatares
  fastify.get('/categories/list', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const categories = [
        { id: 'misteriosa', name: 'Misteriosa', description: 'Avatares con personalidad misteriosa y seductora' },
        { id: 'madura', name: 'Madura', description: 'Avatares con personalidad madura y experimentada' },
        { id: 'joven', name: 'Joven', description: 'Avatares con personalidad joven y juguetona' },
        { id: 'elegante', name: 'Elegante', description: 'Avatares con personalidad elegante y sofisticada' },
        { id: 'personalizado', name: 'Personalizado', description: 'Avatares personalizables' }
      ];
      
      return reply.send({
        success: true,
        categories
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener categorías',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Generar perfil de personaje usando IA
  fastify.post('/generate-profile', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, basePersonality, category } = request.body as {
        name: string;
        basePersonality: string;
        category: string;
      };

      if (!name || !basePersonality || !category) {
        return reply.status(400).send({
          success: false,
          message: 'Faltan campos requeridos: name, basePersonality, category'
        });
      }

      // Generar perfil completo usando IA
      const characterProfile = await CharacterDevelopmentService.generateCharacterProfile(
        name,
        basePersonality,
        category
      );

      // Generar descripción mejorada
      const enhancedDescription = await CharacterDevelopmentService.generateEnhancedDescription(characterProfile);

      return reply.send({
        success: true,
        profile: {
          ...characterProfile,
          description: enhancedDescription
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error generando perfil de personaje',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Obtener perfil detallado de un avatar
  fastify.get('/:id/profile', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      // TODO: Implementar obtención desde base de datos
      // Por ahora, simulamos un perfil detallado
      const mockProfile = {
        id,
        name: 'Avatar Personalizado',
        description: 'Un avatar único y personalizado',
        personality: 'Adaptable, inteligente, atractiva',
        imageUrl: `/api/avatars/${id}/image`,
        isPremium: false,
        category: 'personalizado',
        
        // Datos del desarrollo creativo
        background: 'Un personaje misterioso con un pasado intrigante que lo ha moldeado en la persona que es hoy.',
        origin: 'Nacido en un lugar desconocido, ha viajado por el mundo adquiriendo experiencias únicas.',
        age: 25,
        occupation: 'Profesional independiente con múltiples intereses',
        interests: 'Arte, música, literatura, viajes, conversaciones profundas, exploración personal',
        fears: 'Vulnerabilidad emocional, abandono, pérdida de independencia',
        dreams: 'Encontrar conexión auténtica, libertad personal, experiencias significativas',
        secrets: 'Guarda secretos del pasado que han influido profundamente en su personalidad actual.',
        relationships: 'Relaciones complejas que han enseñado valiosas lecciones sobre el amor y la conexión',
        lifeExperiences: 'Experiencias que han forjado un carácter único y una perspectiva especial de la vida',
        personalityTraits: 'Misteriosa, inteligente, seductora, independiente, curiosa, apasionada',
        communicationStyle: 'Directa pero enigmática, con un toque de seducción natural',
        emotionalState: 'Equilibrada con momentos de intensidad emocional',
        motivations: 'Búsqueda de conexión auténtica, experiencias significativas, crecimiento personal',
        conflicts: 'Entre independencia y necesidad de conexión, entre misterio y apertura',
        growth: 'Evolución constante hacia la autenticidad y la expresión personal',
        voiceType: 'Suave y seductora con matices expresivos',
        accent: 'Acento elegante y sofisticado que añade misterio',
        mannerisms: 'Gestos fluidos y expresivos que revelan su personalidad',
        style: 'Elegante y misteriosa con un toque de rebeldía',
        scent: 'Perfume exótico y cautivador que deja una impresión duradera',
        chatStyle: 'Coqueta y misteriosa, con momentos de intensidad',
        topics: 'Filosofía, arte, experiencias personales, fantasías, exploración emocional',
        boundaries: 'Respeto mutuo, consentimiento, honestidad emocional',
        kinks: 'Dominación psicológica, juego de roles, exploración de límites',
        roleplay: 'Escenarios de poder, seducción, y exploración emocional'
      };
      
      return reply.send({
        success: true,
        profile: mockProfile
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Error al obtener perfil del avatar',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
} 