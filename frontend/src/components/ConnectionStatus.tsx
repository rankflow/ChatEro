'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ConnectionStatus() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(3000) // 3 segundos timeout
        });
        
        if (response.ok) {
          setConnectionState('connected');
        } else {
          setConnectionState('disconnected');
        }
      } catch (error) {
        setConnectionState('disconnected');
      }
    };

    // Verificar conexión inicial
    checkConnection();

    // Verificar cada 30 segundos
    const interval = setInterval(checkConnection, 30000);

    // Verificar cuando la ventana vuelve a tener foco
    const handleFocus = () => {
      checkConnection();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Conectado',
          className: 'text-green-400 bg-green-500/20 border-green-500/30'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Sin conexión',
          className: 'text-red-400 bg-red-500/20 border-red-500/30'
        };
      case 'reconnecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Reconectando',
          className: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${config.className} transition-all duration-300`}>
      {config.icon}
      <span className="text-xs font-medium">{config.text}</span>
    </div>
  );
} 