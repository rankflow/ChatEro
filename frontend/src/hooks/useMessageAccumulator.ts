import { useState, useRef, useCallback } from 'react';

interface UseMessageAccumulatorProps {
  onSendMessage: (message: string) => Promise<void>;
  onShowMessage: (message: string) => void;
  isResponding: boolean; // Nueva prop
}

export const useMessageAccumulator = ({ onSendMessage, onShowMessage, isResponding }: UseMessageAccumulatorProps) => {
  const [acumulado, setAcumulado] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const acumuladoRef = useRef(acumulado);

  // Mantener el ref actualizado
  acumuladoRef.current = acumulado;

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimeout = useCallback((delay: number) => {
    clearCurrentTimeout();
    timeoutRef.current = setTimeout(() => {
      if (acumuladoRef.current.trim()) {
        onSendMessage(acumuladoRef.current);
        setAcumulado('');
      }
    }, delay);
  }, [onSendMessage, clearCurrentTimeout]);

  const sendWithAccumulation = useCallback(async (message: string) => {
    // Siempre mostrar el mensaje individual en el frontend
    onShowMessage(message);
    
    // Acumular el mensaje
    const nuevoAcumulado = acumulado ? `${acumulado}\n\n${message}` : message;
    setAcumulado(nuevoAcumulado);

    // Limpiar timeout anterior
    clearCurrentTimeout();
    
    // 3ª condición: Si la IA está respondiendo, pausar contador
    if (isResponding) {
      return;
    }
    
    // Iniciar timeout de 2000ms para envío automático
    // La evaluación del textarea se hará en handleTextareaChange
    startTimeout(2000);
  }, [acumulado, onSendMessage, onShowMessage, clearCurrentTimeout, isResponding, startTimeout]);

  const handleTextareaChange = useCallback((value: string) => {
    // Solo reiniciar timeout si hay mensajes acumulados y la IA no está respondiendo
    if (acumulado.trim() && !isResponding) {
      const isTextareaEmpty = !value.trim();
      const delay = isTextareaEmpty ? 2000 : 20000;
      
      // Limpiar timeout anterior
      clearCurrentTimeout();
      
      // Iniciar nuevo timeout
      timeoutRef.current = setTimeout(() => {
        if (acumulado.trim()) {
          onSendMessage(acumulado);
          setAcumulado('');
        }
      }, delay);
    }
  }, [acumulado, onSendMessage, clearCurrentTimeout, isResponding]);

  // Efecto para reanudar contador cuando la IA termina de responder
  const reanudarContador = useCallback(() => {
    if (acumulado.trim() && !isResponding) {
      const textareaValue = textareaRef.current?.value || '';
      const isTextareaEmpty = !textareaValue.trim();
      const delay = isTextareaEmpty ? 2000 : 20000;
      
      startTimeout(delay);
    }
  }, [acumulado, isResponding, startTimeout]);

  // Usar useEffect para detectar cuando isResponding cambia
  const prevIsRespondingRef = useRef(isResponding);
  if (prevIsRespondingRef.current && !isResponding) {
    // La IA terminó de responder
    reanudarContador();
  }
  prevIsRespondingRef.current = isResponding;

  const resetAccumulator = useCallback(() => {
    setAcumulado('');
    clearCurrentTimeout();
  }, [clearCurrentTimeout]);

  const setTextareaRef = useCallback((ref: HTMLTextAreaElement | null) => {
    textareaRef.current = ref;
  }, []);

  return {
    sendWithAccumulation,
    handleTextareaChange,
    resetAccumulator,
    setTextareaRef,
    acumulado
  };
}; 