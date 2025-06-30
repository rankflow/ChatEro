import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default async function avatarRoutes(fastify: FastifyInstance) {
  // Obtener lista de avatares disponibles
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // TODO: Implementar obtención desde base de datos
      // Por ahora, simulamos los avatares
      
      const mockAvatars = [
        {
          id: 'avatar_1',
          name: 'Luna',
          description: 'Una chica misteriosa y seductora',
          personality: 'Misteriosa, seductora, inteligente',
          imageUrl: '/api/avatars/avatar_1/image',
          isPremium: false,
          category: 'misteriosa'
        },
        {
          id: 'avatar_2',
          name: 'Sofia',
          description: 'Una mujer madura y experimentada',
          personality: 'Madura, experimentada, dominante',
          imageUrl: '/api/avatars/avatar_2/image',
          isPremium: true,
          category: 'madura'
        },
        {
          id: 'avatar_3',
          name: 'Aria',
          description: 'Una chica joven y juguetona',
          personality: 'Juguetona, inocente, curiosa',
          imageUrl: '/api/avatars/avatar_3/image',
          isPremium: false,
          category: 'joven'
        },
        {
          id: 'avatar_4',
          name: 'Venus',
          description: 'Una diosa de la belleza y el amor',
          personality: 'Elegante, sofisticada, apasionada',
          imageUrl: '/api/avatars/avatar_4/image',
          isPremium: true,
          category: 'elegante'
        }
      ];
      
      return reply.send({
        success: true,
        avatars: mockAvatars,
        total: mockAvatars.length
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
} 