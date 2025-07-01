'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, Crown, User, MapPin, Calendar, Briefcase, Music, Eye, Lock, MessageCircle, Sparkles } from 'lucide-react';
import { apiService } from '@/services/api';

interface CharacterProfile {
  id: string;
  name: string;
  description: string;
  personality: string;
  imageUrl: string;
  isPremium: boolean;
  category: string;
  
  // Desarrollo creativo del personaje
  background?: string;
  origin?: string;
  age?: number;
  occupation?: string;
  interests?: string;
  fears?: string;
  dreams?: string;
  secrets?: string;
  relationships?: string;
  lifeExperiences?: string;
  personalityTraits?: string;
  communicationStyle?: string;
  emotionalState?: string;
  motivations?: string;
  conflicts?: string;
  growth?: string;
  
  // Metadatos del personaje
  voiceType?: string;
  accent?: string;
  mannerisms?: string;
  style?: string;
  scent?: string;
  
  // Configuración del chat
  chatStyle?: string;
  topics?: string;
  boundaries?: string;
  kinks?: string;
  roleplay?: string;
}

export default function AvatarProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiService.getAvatarProfile(params.id as string);
        if (response.success) {
          setProfile(response.profile);
        } else {
          setError('No se pudo cargar el perfil del avatar');
        }
      } catch (err) {
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil del personaje...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el perfil</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/avatars" className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors">
            Volver a Avatares
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/avatars" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a Avatares</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="text-2xl font-bold text-gray-900">Chat Ero</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
              <div className="relative">
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="w-full h-96 object-cover"
                />
                {profile.isPremium && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">Premium</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  <button className="bg-pink-100 text-pink-600 p-2 rounded-lg hover:bg-pink-200 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">{profile.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{profile.personality}</span>
                  </div>
                  {profile.age && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{profile.age} años</span>
                    </div>
                  )}
                  {profile.occupation && (
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{profile.occupation}</span>
                    </div>
                  )}
                  {profile.origin && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{profile.origin}</span>
                    </div>
                  )}
                </div>
                
                <Link
                  href={`/chat?avatar=${profile.id}`}
                  className="w-full bg-pink-500 text-white text-center py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                >
                  Chatear con {profile.name}
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Background & Personality */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Sparkles className="h-6 w-6 text-pink-500 mr-3" />
                Historia y Personalidad
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Trasfondo</h3>
                  <p className="text-gray-600">{profile.background}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rasgos de Personalidad</h3>
                  <p className="text-gray-600">{profile.personalityTraits}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sueños y Aspiraciones</h3>
                  <p className="text-gray-600">{profile.dreams}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Miedos y Vulnerabilidades</h3>
                  <p className="text-gray-600">{profile.fears}</p>
                </div>
              </div>
            </div>

            {/* Life Experiences */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="h-6 w-6 text-purple-500 mr-3" />
                Experiencias de Vida
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experiencias Significativas</h3>
                  <p className="text-gray-600">{profile.lifeExperiences}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Relaciones Importantes</h3>
                  <p className="text-gray-600">{profile.relationships}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Secretos del Pasado</h3>
                  <p className="text-gray-600 flex items-start">
                    <Lock className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                    {profile.secrets}
                  </p>
                </div>
              </div>
            </div>

            {/* Communication & Style */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="h-6 w-6 text-blue-500 mr-3" />
                Estilo y Comunicación
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Estilo de Comunicación</h3>
                  <p className="text-gray-600">{profile.communicationStyle}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Estilo de Chat</h3>
                  <p className="text-gray-600">{profile.chatStyle}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Voz y Acento</h3>
                  <p className="text-gray-600">{profile.voiceType}, {profile.accent}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Manerismos</h3>
                  <p className="text-gray-600">{profile.mannerisms}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Estilo de Vestir</h3>
                  <p className="text-gray-600">{profile.style}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Aroma Característico</h3>
                  <p className="text-gray-600">{profile.scent}</p>
                </div>
              </div>
            </div>

            {/* Interests & Preferences */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Music className="h-6 w-6 text-green-500 mr-3" />
                Intereses y Preferencias
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Intereses y Hobbies</h3>
                  <p className="text-gray-600">{profile.interests}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Temas Favoritos</h3>
                  <p className="text-gray-600">{profile.topics}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Motivaciones</h3>
                  <p className="text-gray-600">{profile.motivations}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Conflictos Internos</h3>
                  <p className="text-gray-600">{profile.conflicts}</p>
                </div>
              </div>
            </div>

            {/* Chat Preferences */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="h-6 w-6 text-pink-500 mr-3" />
                Preferencias de Chat
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Límites y Preferencias</h3>
                  <p className="text-gray-600">{profile.boundaries}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Estilo de Roleplay</h3>
                  <p className="text-gray-600">{profile.roleplay}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 