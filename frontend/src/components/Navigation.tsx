'use client';

import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Image from 'next/image';

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    const authenticated = apiService.isAuthenticated();
    const currentUser = apiService.getCurrentUser();
    
    setIsAuthenticated(authenticated);
    setUser(currentUser);
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'user') {
        checkAuth();
      }
    };

    // Escuchar cambios locales (mismo tab)
    const handleLocalChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleLocalChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleLocalChange);
    };
  }, []);

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/api/logo" alt="Chat Ero Logo" width={48} height={48} className="h-12 w-12" />
              <span className="text-2xl font-bold text-gray-900">Chat Ero</span>
            </Link>
            <div className="flex space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
                      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/api/logo" alt="Chat Ero Logo" width={48} height={48} className="h-12 w-12" />
              <span className="text-2xl font-bold text-gray-900">Chat Ero</span>
            </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-pink-500 transition-colors">
              Características
            </Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-pink-500 transition-colors">
              Precios
            </Link>
            <Link href="/#legal" className="text-gray-600 hover:text-pink-500 transition-colors">
              Legal
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-5 w-5 text-pink-500" />
                  <span className="text-sm font-medium">
                    {user?.username || user?.email || 'Usuario'}
                  </span>
                </div>
                <Link 
                  href="/chat" 
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
                >
                  Ir al Chat
                </Link>
                <Link 
                  href="/payments" 
                  className="text-gray-600 hover:text-purple-500 transition-colors px-4 py-2 rounded-lg flex items-center"
                >
                  💰 Comprar Tokens
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Salir</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-pink-500 transition-colors px-4 py-2 rounded-lg flex items-center"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/register" 
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 