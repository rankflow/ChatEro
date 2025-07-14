'use client';

import { useState, useEffect, useRef } from 'react';
import { apiService, ChatMessage, ChatResponse, Avatar, ConversationMemory } from '../../services/api';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  tokensUsed?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [userTokens, setUserTokens] = useState(0);
  const [conversationMemory, setConversationMemory] = useState<ConversationMemory | undefined>(undefined);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verificar autenticación al cargar
    if (!apiService.isAuthenticated()) {
      console.log('[AUTH] Usuario no autenticado, redirigiendo...');
      console.log('[DEBUG] Token en localStorage:', localStorage.getItem('authToken') ? 'SÍ' : 'NO');
      console.log('[DEBUG] Usuario en localStorage:', localStorage.getItem('user') ? 'SÍ' : 'NO');
      
      // Intentar login automático antes de redirigir
      apiService.login({
        email: 'test@example.com',
        password: 'password123'
      }).then(() => {
        console.log('[DEBUG] Login automático exitoso, continuando...');
        loadAvatars();
        loadUserTokens();
        loadChatHistory();
      }).catch(error => {
        console.log('[DEBUG] Error en login automático:', error);
        window.location.href = '/login';
      });
      return;
    }
    
    loadAvatars();
    loadUserTokens();
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAvatars = async () => {
    try {
      const response = await apiService.getAvatars();
      if (response.success) {
        setAvatars(response.avatars);
        // Seleccionar el primer avatar por defecto
        if (response.avatars.length > 0) {
          setSelectedAvatar(response.avatars[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando avatares:', error);
    }
  };

  const handleAvatarChange = (newAvatar: Avatar) => {
    console.log(`[AVATAR] Cambiando de ${selectedAvatar?.name} a ${newAvatar.name}`);
    
    // Limpiar contexto cuando se cambia de avatar
    setMessages([]);
    setConversationMemory(undefined);
    
    // Actualizar avatar seleccionado
    setSelectedAvatar(newAvatar);
    
    // Mostrar indicador de cambio
    setAvatarChanged(true);
    setTimeout(() => setAvatarChanged(false), 3000); // Ocultar después de 3 segundos
    
    console.log(`[AVATAR] Contexto limpiado para ${newAvatar.name}`);
  };

  const loadUserTokens = async () => {
    try {
      const response = await apiService.getUserTokens();
      if (response.success) {
        setUserTokens(response.tokens);
      }
    } catch (error) {
      console.error('Error cargando tokens:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await apiService.getChatHistory();
      if (response.success) {
        const formattedMessages = response.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.isUser,
          timestamp: msg.createdAt,
          tokensUsed: msg.tokensUsed,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Convertir mensajes del frontend al formato del backend
      // Filtrar mensajes que no tengan contenido válido
      console.log('[DEBUG] Mensajes antes del filtro:', messages);
      
      const conversationHistory = messages
        .filter(msg => {
          const hasContent = msg.content && msg.content.trim() !== '';
          if (!hasContent) {
            console.log('[DEBUG] Mensaje filtrado por contenido vacío:', msg);
          }
          return hasContent;
        })
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.content.trim()
        }));
      
      console.log('[DEBUG] ConversationHistory después del filtro:', conversationHistory);

      const chatMessage: ChatMessage = {
        message: inputMessage,
        avatarId: selectedAvatar?.id,
        conversationMemory: conversationMemory || {}, // Enviar objeto vacío en lugar de undefined
        conversationHistory: conversationHistory, // Enviar historial
      };

      const response: ChatResponse = await apiService.sendMessage(chatMessage);

      if (response.success) {
        const aiMessage: Message = {
          id: response.messageId,
          content: response.message,
          isUser: false,
          timestamp: response.timestamp,
          tokensUsed: response.tokensUsed,
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Actualizar memoria contextual si se devuelve
        if (response.conversationMemory) {
          setConversationMemory(response.conversationMemory);
          console.log('[MEMORY] Memoria actualizada:', response.conversationMemory);
        }
        
        // Actualizar tokens del usuario
        await loadUserTokens();
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('autenticado') || error.message.includes('sesión')) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
          // Redirigir al login después de un momento
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (error.message.includes('permisos')) {
          errorMessage = 'No tienes permisos para enviar mensajes.';
        } else {
          errorMessage = error.message;
        }
      }
      
      const errorMessageObj: Message = {
        id: `error-${Date.now()}`,
        content: errorMessage,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = async () => {
    try {
      const response = await apiService.clearChatHistory();
      if (response.success) {
        setMessages([]);
        setConversationMemory(undefined); // Limpiar memoria también
        console.log('[MEMORY] Memoria limpiada');
      }
    } catch (error) {
      console.error('Error limpiando historial:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!apiService.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Requerido</h2>
          <p className="text-white/80 mb-6">Necesitas iniciar sesión para acceder al chat.</p>
          <a
            href="/"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
          >
            Ir al Inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Chat IA</h1>
              {selectedAvatar && (
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{selectedAvatar.name[0]}</span>
                  </div>
                  <span className="text-white text-sm">{selectedAvatar.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-white text-sm">Tokens: {userTokens}</span>
              </div>
              {conversationMemory && (
                <div className="bg-blue-500/20 rounded-lg px-3 py-1">
                  <span className="text-blue-200 text-xs">
                    Memoria: {conversationMemory.turnCount || 0} turnos
                  </span>
                </div>
              )}
              <button
                onClick={handleClearHistory}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-1 rounded-lg text-sm transition-all duration-300"
              >
                Limpiar Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      {avatars.length > 0 && (
        <div className="bg-black/10 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarChange(avatar)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    selectedAvatar?.id === avatar.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{avatar.name[0]}</span>
                  </div>
                  <span className="text-sm font-medium">{avatar.name}</span>
                  {avatar.isPremium && (
                    <span className="text-yellow-400 text-xs">⭐</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl h-[600px] flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-lg">Inicia una conversación con tu avatar</p>
                <p className="text-sm mt-2">Selecciona un avatar y escribe tu primer mensaje</p>
              </div>
            ) : (
              <>
                {avatarChanged && (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-200 px-4 py-2 rounded-lg text-sm">
                      <span>🔄</span>
                      <span>Cambiado a {selectedAvatar?.name} - Contexto limpiado</span>
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.isUser
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {!message.isUser && selectedAvatar && (
                          <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-xs font-bold">{selectedAvatar.name[0]}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                            <span>{formatTime(message.timestamp)}</span>
                            {message.tokensUsed && (
                              <span className="ml-4">Tokens: {message.tokensUsed}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{selectedAvatar?.name[0] || 'A'}</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="w-full bg-white/10 text-white placeholder-white/50 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-300"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
              >
                <span>Enviar</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 