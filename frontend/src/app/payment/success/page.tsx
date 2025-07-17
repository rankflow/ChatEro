'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/chat');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Icono de éxito */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso! 🎉
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          Tu pago ha sido procesado correctamente. 
          Ya puedes disfrutar de tus tokens o suscripción.
        </p>

        {/* Detalles del pago */}
        {paymentIntent && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Detalles del Pago
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>ID de Pago: {paymentIntent}</p>
              <p>Estado: Completado</p>
              <p>Fecha: {new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            href="/chat"
            className="block w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Ir al Chat
          </Link>

          <Link
            href="/payments"
            className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Comprar Más Tokens
          </Link>
        </div>

        {/* Redirección automática */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            Redirigiendo automáticamente al chat en {countdown} segundos...
          </p>
        </div>

        {/* Información adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            📧 Recibirás un email de confirmación
          </h4>
          <p className="text-sm text-gray-600">
            Hemos enviado un email con los detalles de tu compra. 
            Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
      </div>
    </div>
  );
} 