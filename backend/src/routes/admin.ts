import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/aiService.js';
import { Avatar } from '../types/index.js';


const prisma = new PrismaClient();

export default async function adminRoutes(fastify: FastifyInstance) {
  // Middleware de autenticación para admin (puedes ajustar la lógica)
  const authenticateAdmin = async (request: any, reply: any) => {
    // Por ahora, una autenticación simple - puedes mejorarla después
    const adminToken = request.headers['x-admin-token'];
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return reply.status(401).send({ error: 'Acceso no autorizado' });
    }
  };

  // Obtener todos los avatares para administración
  fastify.get('/api/admin/avatars', {
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    try {
      const avatars = await prisma.avatar.findMany({
        orderBy: { id: 'asc' }
      });
      
      return reply.send({ avatars });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al obtener avatares' });
    }
  });

  // Obtener un avatar específico para edición
  fastify.get('/api/admin/avatars/:id', {
    preHandler: authenticateAdmin
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      const avatar = await prisma.avatar.findUnique({
        where: { id }
      });
      
      if (!avatar) {
        return reply.status(404).send({ error: 'Avatar no encontrado' });
      }
      
      return reply.send({ avatar });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al obtener avatar' });
    }
  });

  // Actualizar un avatar
  fastify.put('/api/admin/avatars/:id', {
    preHandler: authenticateAdmin
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;
      
      // Validar que el avatar existe
      const existingAvatar = await prisma.avatar.findUnique({
        where: { id }
      });
      
      if (!existingAvatar) {
        return reply.status(404).send({ error: 'Avatar no encontrado' });
      }
      
      // Actualizar el avatar
      const updatedAvatar = await prisma.avatar.update({
        where: { id },
        data: {
          name: updateData.name,
          description: updateData.description,
          personality: updateData.personality,
          imageUrl: updateData.imageUrl,
          isPremium: updateData.isPremium,
          category: updateData.category,
          isActive: updateData.isActive,
          background: updateData.background,
          origin: updateData.origin,
          age: updateData.age,
          occupation: updateData.occupation,
          interests: updateData.interests,
          fears: updateData.fears,
          dreams: updateData.dreams,
          secrets: updateData.secrets,
          relationships: updateData.relationships,
          lifeExperiences: updateData.lifeExperiences,
          personalityTraits: updateData.personalityTraits,
          communicationStyle: updateData.communicationStyle,
          emotionalState: updateData.emotionalState,
          motivations: updateData.motivations,
          conflicts: updateData.conflicts,
          growth: updateData.growth,
          voiceType: updateData.voiceType,
          accent: updateData.accent,
          mannerisms: updateData.mannerisms,
          style: updateData.style,
          scent: updateData.scent,
          chatStyle: updateData.chatStyle,
          topics: updateData.topics,
          boundaries: updateData.boundaries,
          kinks: updateData.kinks,
          roleplay: updateData.roleplay
        }
      });
      
      return reply.send({ 
        message: 'Avatar actualizado correctamente',
        avatar: updatedAvatar 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al actualizar avatar' });
    }
  });

  // Crear un nuevo avatar
  fastify.post('/api/admin/avatars', {
    preHandler: authenticateAdmin
  }, async (request: any, reply) => {
    try {
      const avatarData = request.body;
      
      const newAvatar = await prisma.avatar.create({
        data: {
          name: avatarData.name,
          description: avatarData.description,
          personality: avatarData.personality,
          imageUrl: avatarData.imageUrl || 'https://via.placeholder.com/300x400',
          isPremium: avatarData.isPremium || false,
          category: avatarData.category || 'general',
          isActive: avatarData.isActive !== undefined ? avatarData.isActive : true,
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
      
      return reply.status(201).send({ 
        message: 'Avatar creado correctamente',
        avatar: newAvatar 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al crear avatar' });
    }
  });

  // Eliminar un avatar
  fastify.delete('/api/admin/avatars/:id', {
    preHandler: authenticateAdmin
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      
      // Verificar que el avatar existe
      const existingAvatar = await prisma.avatar.findUnique({
        where: { id }
      });
      
      if (!existingAvatar) {
        return reply.status(404).send({ error: 'Avatar no encontrado' });
      }
      
      // Eliminar el avatar
      await prisma.avatar.delete({
        where: { id }
      });
      
      return reply.send({ message: 'Avatar eliminado correctamente' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Error al eliminar avatar' });
    }
  });

  // Función para construir el prompt de autocompletado
  function buildAutocompletePrompt(partialAvatar: Partial<Avatar>): string {
    const filledFields = Object.entries(partialAvatar)
      .filter(([_, value]) => value && value.toString().trim() !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return `Eres un asistente experto en crear personajes para un chat erótico. Basándote en los siguientes datos proporcionados, completa todos los campos faltantes del personaje de manera coherente y detallada.

DATOS PROPORCIONADOS:
${filledFields}

INSTRUCCIONES:
1. Usa los datos proporcionados como base y contexto
2. Completa todos los campos faltantes de manera coherente
3. Expande y mejora los campos que ya están llenos
4. Mantén consistencia entre todos los campos
5. Genera contenido rico, detallado y atractivo
6. El personaje debe ser para un chat erótico adulto (18+)
7. Puedes ser explícito pero respetuoso

CAMPOS A COMPLETAR:
- name: Nombre del personaje
- age: Edad (número)
- gender: Género
- personality: Personalidad general
- description: Descripción física y atractiva
- background: Trasfondo e historia detallada
- origin: Orígenes y procedencia
- occupation: Ocupación o profesión
- interests: Intereses y hobbies
- fears: Miedos y vulnerabilidades
- dreams: Sueños y aspiraciones
- secrets: Secretos del personaje
- relationships: Historia de relaciones
- lifeExperiences: Experiencias de vida significativas
- personalityTraits: Rasgos de personalidad específicos
- communicationStyle: Estilo de comunicación
- emotionalState: Estado emocional típico
- motivations: Motivaciones principales
- conflicts: Conflictos internos o externos
- growth: Áreas de crecimiento personal
- voiceType: Tipo de voz
- accent: Acento o forma de hablar
- mannerisms: Manerismos y gestos
- style: Estilo personal
- scent: Aroma o perfume
- chatStyle: Estilo de chat
- topics: Temas de conversación preferidos
- boundaries: Límites personales
- kinks: Preferencias sexuales
- roleplay: Escenarios de roleplay preferidos

Responde SOLO con un JSON válido que contenga todos estos campos completados. No incluyas explicaciones adicionales.`;
  }

  // Función para parsear la respuesta de la IA
  function parseAIResponse(aiResponse: string, partialAvatar: Partial<Avatar>): Partial<Avatar> {
    try {
      // Intentar extraer JSON de la respuesta
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Combinar los datos originales con los generados por la IA
      return {
        ...partialAvatar,
        ...parsed
      };
    } catch (error) {
      console.error('Error parseando respuesta de IA:', error);
      // Fallback: devolver los datos originales
      return partialAvatar;
    }
  }

  // Ruta para autocompletar personaje con IA
  fastify.post('/api/admin/avatars/autocomplete', async (request, reply) => {
    try {
      const { partialAvatar } = request.body as { partialAvatar: Partial<Avatar> };
      
      if (!partialAvatar) {
        return reply.status(400).send({ error: 'Se requieren datos del personaje' });
      }

      // Construir el prompt para la IA basado en los datos proporcionados
      const prompt = buildAutocompletePrompt(partialAvatar);
      
      try {
        // Usar el servicio de IA para generar el contenido
        const response = await AIService.generateContent(prompt);
        
        // Parsear la respuesta de la IA
        const completedAvatar = parseAIResponse(response, partialAvatar);
        
        reply.send({ avatar: completedAvatar });
      } catch (aiError) {
        console.error('Error de IA:', aiError);
        reply.status(503).send({ 
          error: 'El servidor de IA no está disponible. Asegúrate de que Ollama/Mistral esté ejecutándose en localhost:11434',
          details: aiError instanceof Error ? aiError.message : 'Error desconocido'
        });
      }
    } catch (error) {
      console.error('Error en autocompletado:', error);
      reply.status(500).send({ error: 'Error al autocompletar el personaje' });
    }
  });


} 