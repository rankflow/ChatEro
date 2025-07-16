'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../services/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  const checkAuth = () => {
    const authenticated = apiService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      router.push('/login');
    }
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
  }, [router]);

  // Mostrar loading mientras verifica autenticación
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (ya redirige)
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
} 