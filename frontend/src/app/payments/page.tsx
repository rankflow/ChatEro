'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PaymentPackages from '../../components/PaymentPackages';
import PaymentForm from '../../components/PaymentForm';

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

export default function PaymentsPage() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowForm(true);
  };

  const handlePaymentSuccess = () => {
    // Redirigir al chat después del pago exitoso
    router.push('/chat');
  };

  const handleCancel = () => {
    setSelectedPackage(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              💰 Sistema de Pagos
            </h1>
            <p className="text-lg text-gray-600">
              Compra tokens para chatear con nuestros avatares o suscríbete para acceso ilimitado
            </p>
          </div>

          {/* Contenido */}
          {!showForm ? (
            <PaymentPackages 
              onPackageSelect={handlePackageSelect}
              isLoading={false}
            />
          ) : selectedPackage ? (
            <div className="space-y-6">
              <div className="text-center">
                <button
                  onClick={handleCancel}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  ← Volver a paquetes
                </button>
              </div>
              
              <PaymentForm
                selectedPackage={selectedPackage}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancel}
              />
            </div>
          ) : null}

          {/* Información adicional */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📋 Información Importante
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💳 Pagos Seguros</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Procesados por Stripe (PCI DSS compliant)</li>
                  <li>• No almacenamos datos de tarjetas</li>
                  <li>• Pagos encriptados de extremo a extremo</li>
                  <li>• Soporte para múltiples métodos de pago</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🪙 Sistema de Tokens</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 1 token = 1 mensaje con IA</li>
                  <li>• Los tokens no expiran</li>
                  <li>• Consumo automático al chatear</li>
                  <li>• Recarga ilimitada disponible</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📅 Suscripciones</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Acceso ilimitado durante el período</li>
                  <li>• Renovación automática</li>
                  <li>• Cancelación en cualquier momento</li>
                  <li>• Sin límite de mensajes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🔄 Reembolsos</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 30 días de garantía</li>
                  <li>• Reembolso completo disponible</li>
                  <li>• Contacto directo para soporte</li>
                  <li>• Proceso simple y rápido</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ❓ Preguntas Frecuentes
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  ¿Cómo funcionan los tokens?
                </h4>
                <p className="text-sm text-gray-600">
                  Cada vez que envíes un mensaje a un avatar, se consume 1 token. 
                  Los tokens se compran en paquetes y no tienen fecha de expiración.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  ¿Puedo cancelar mi suscripción?
                </h4>
                <p className="text-sm text-gray-600">
                  Sí, puedes cancelar tu suscripción en cualquier momento desde tu 
                  perfil o contactando soporte. No hay penalizaciones por cancelación.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  ¿Qué métodos de pago aceptan?
                </h4>
                <p className="text-sm text-gray-600">
                  Aceptamos todas las tarjetas principales (Visa, MasterCard, American Express), 
                  así como PayPal y otros métodos de pago locales según tu región.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  ¿Es seguro mi pago?
                </h4>
                <p className="text-sm text-gray-600">
                  Absolutamente. Utilizamos Stripe, líder mundial en procesamiento de pagos, 
                  con certificación PCI DSS y encriptación de extremo a extremo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 