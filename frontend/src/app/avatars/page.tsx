'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Crown, Filter, Search, Eye } from 'lucide-react';

interface Avatar {
  id: string;
  name: string;
  description: string;
  personality: string;
  imageUrl: string;
  isPremium: boolean;
  category: string;
}

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'misteriosa', name: 'Misteriosa' },
    { id: 'madura', name: 'Madura' },
    { id: 'joven', name: 'Joven' },
    { id: 'elegante', name: 'Elegante' },
    { id: 'personalizado', name: 'Personalizado' }
  ];

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/avatars')
      .then(res => res.json())
      .then(data => {
        setAvatars(data.avatars || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredAvatars = avatars.filter(avatar => {
    const matchesCategory = selectedCategory === 'all' || avatar.category === selectedCategory;
    const matchesSearch = avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         avatar.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando avatares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Elige tu Avatar
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre personajes únicos con personalidades distintas. 
            Cada avatar tiene su propio estilo y forma de interactuar.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar avatares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Avatars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAvatars.map((avatar) => (
            <div key={avatar.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Avatar Image */}
              <div className="relative">
                <img
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  className="w-full h-80 object-cover"
                />
                {avatar.isPremium && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </div>
                )}
              </div>

              {/* Avatar Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{avatar.name}</h3>
                  {avatar.isPremium && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{avatar.description}</p>
                <p className="text-gray-500 text-xs mb-4">{avatar.personality}</p>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link
                    href={`/chat?avatar=${avatar.id}`}
                    className="flex-1 bg-pink-500 text-white text-center py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
                  >
                    Chatear
                  </Link>
                  <Link
                    href={`/avatars/${avatar.id}`}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    title="Ver perfil detallado"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAvatars.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron avatares</h3>
            <p className="text-gray-600">Intenta ajustar los filtros o la búsqueda.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            &copy; 2024 Chat Ero. Todos los avatares son generados por IA y no representan personas reales.
          </p>
        </div>
      </footer>
    </div>
  );
} 