'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  tokens: number;
  type: 'tokens' | 'subscription';
  isPopular: boolean;
}

interface PaymentPackagesProps {
  onPackageSelect: (pkg: Package) => void;
  isLoading?: boolean;
}

export default function PaymentPackages({ onPackageSelect, isLoading = false }: PaymentPackagesProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payments/packages`, {
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPackages(data.packages);
      } else {
        setError('Error al cargar paquetes');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Error al cargar paquetes');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const amount = price / 100; // Stripe usa centavos
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatTokens = (tokens: number) => {
    if (tokens === -1) return 'Ilimitados';
    return `${tokens.toLocaleString()} tokens`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchPackages}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Compra Tokens
        </h2>
        <p className="text-gray-600">
          Selecciona un paquete para continuar con el chat
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
              pkg.isPopular 
                ? 'border-purple-500 ring-2 ring-purple-200' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            {pkg.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </span>
              </div>
            )}

            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {pkg.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {formatPrice(pkg.price, pkg.currency)}
                </div>
                <div className="text-sm text-gray-500">
                  {pkg.type === 'subscription' ? 'por mes' : 'pago único'}
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-lg font-semibold text-gray-900">
                  {formatTokens(pkg.tokens)}
                </div>
                {pkg.type === 'subscription' && (
                  <div className="text-xs text-green-600 mt-1">
                    Acceso ilimitado
                  </div>
                )}
              </div>

              <button
                onClick={() => onPackageSelect(pkg)}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                }`}
              >
                {isLoading ? 'Procesando...' : 'Seleccionar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          Los tokens se consumen automáticamente al chatear con los avatares.
          <br />
          Las suscripciones te dan acceso ilimitado durante el período contratado.
        </p>
      </div>
    </div>
  );
} 