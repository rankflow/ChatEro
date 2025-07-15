'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Users, Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Chat con{' '}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              IA + Avatares
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Descubre una nueva forma de interactuar con inteligencia artificial. 
            Elige tu avatar favorito y disfruta de conversaciones únicas y personalizadas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/avatars" 
              className="bg-pink-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Explorar Avatares
            </Link>
            <Link 
              href="/chat" 
              className="border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              Empezar Chat
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para una experiencia de chat única y segura
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat Inteligente</h3>
              <p className="text-gray-600">
                Conversaciones fluidas y naturales con IA de última generación
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Avatares Únicos</h3>
              <p className="text-gray-600">
                Elige entre una variedad de personajes con personalidades distintas
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacidad Total</h3>
              <p className="text-gray-600">
                Tus conversaciones están protegidas y son completamente privadas
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Respuesta Rápida</h3>
              <p className="text-gray-600">
                Respuestas instantáneas para una experiencia fluida
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contenido Personalizado</h3>
              <p className="text-gray-600">
                Experiencias adaptadas a tus preferencias y gustos
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Filtros de Seguridad</h3>
              <p className="text-gray-600">
                Contenido filtrado y seguro para adultos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section id="legal" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Aviso Legal Importante
            </h2>
            <div className="space-y-4 text-gray-600">
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="font-semibold text-yellow-800">⚠️ Contenido para Adultos</p>
                <p>Este servicio está destinado únicamente para usuarios mayores de 18 años.</p>
              </div>
              
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="font-semibold text-blue-800">🤖 Inteligencia Artificial</p>
                <p>Todas las conversaciones son con IA. Los avatares son generados por computadora y no representan personas reales.</p>
              </div>
              
              <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                <p className="font-semibold text-green-800">🔒 Privacidad Garantizada</p>
                <p>Tus conversaciones son privadas y no se comparten con terceros.</p>
              </div>
              
              <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
                <p className="font-semibold text-red-800">🚫 Contenido Prohibido</p>
                <p>No se permite contenido ilegal, dañino o que suplante identidades reales.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-pink-500" />
                <span className="text-xl font-bold">Chat Ero</span>
              </div>
              <p className="text-gray-400">
                La nueva forma de interactuar con inteligencia artificial.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/avatars" className="hover:text-white transition-colors">Avatares</Link></li>
                <li><Link href="/chat" className="hover:text-white transition-colors">Chat</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Precios</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white transition-colors">Descargo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Ayuda</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Chat Ero. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
