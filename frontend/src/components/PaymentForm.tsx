'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

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

interface PaymentFormProps {
  selectedPackage: Package;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ selectedPackage, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);

  useEffect(() => {
    const initStripe = async () => {
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        setError('Configuración de Stripe no encontrada');
        return;
      }

      const stripeInstance = await loadStripe(stripeKey);
      setStripe(stripeInstance);
    };

    initStripe();
  }, []);

  const formatPrice = (price: number, currency: string) => {
    const amount = price / 100;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const handlePayment = async () => {
    if (!stripe) {
      setError('Stripe no está cargado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear Payment Intent
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        body: JSON.stringify({
          amount: selectedPackage.price,
          currency: selectedPackage.currency,
          paymentMethod: selectedPackage.type,
          packageId: selectedPackage.id
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al crear intent de pago');
      }

      // Confirmar pago con Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        clientSecret: data.paymentIntent.client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      onSuccess();
    } catch (error) {
      console.error('Error en el pago:', error);
      setError(error instanceof Error ? error.message : 'Error en el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener información del cliente
      const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payments/customer-info`, {
        headers: {
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });

      const customerData = await customerResponse.json();

      if (!customerData.success) {
        throw new Error('Error al obtener información del cliente');
      }

      // Crear suscripción
      const subscriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payments/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        body: JSON.stringify({
          priceId: selectedPackage.id,
          customerId: customerData.customer.id
        })
      });

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionData.success) {
        throw new Error('Error al crear suscripción');
      }

      // Redirigir a Stripe para completar la suscripción
      if (subscriptionData.subscription.latest_invoice?.payment_intent?.client_secret) {
        const { error: stripeError } = await stripe.confirmPayment({
          clientSecret: subscriptionData.subscription.latest_invoice.payment_intent.client_secret,
          confirmParams: {
            return_url: `${window.location.origin}/payment/success`,
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error en la suscripción:', error);
      setError(error instanceof Error ? error.message : 'Error en la suscripción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirmar Pago
        </h2>
        <p className="text-gray-600">
          Estás a punto de comprar:
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-900">{selectedPackage.name}</span>
          <span className="text-lg font-bold text-purple-600">
            {formatPrice(selectedPackage.price, selectedPackage.currency)}
          </span>
        </div>
        <p className="text-sm text-gray-600">{selectedPackage.description}</p>
        {selectedPackage.type === 'subscription' && (
          <p className="text-xs text-green-600 mt-1">
            Acceso ilimitado durante el período contratado
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={selectedPackage.type === 'subscription' ? handleSubscription : handlePayment}
          disabled={loading || !stripe}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            loading || !stripe
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
          }`}
        >
          {loading ? 'Procesando...' : `Pagar ${formatPrice(selectedPackage.price, selectedPackage.currency)}`}
        </button>

        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>

      <div className="text-center text-xs text-gray-500 mt-6">
        <p>
          Tu pago será procesado de forma segura por Stripe.
          <br />
          No almacenamos información de tu tarjeta.
        </p>
      </div>
    </div>
  );
} 