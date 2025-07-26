'use client';

import { useState, useEffect, useRef } from 'react';
import { apiService, ChatMessage, ChatResponse, Avatar, ConversationMemory } from '../../services/api';
import { useMessageAccumulator } from '../../hooks/useMessageAccumulator';
import AuthGuard from '../../components/AuthGuard';
import ConnectionStatus from '../../components/ConnectionStatus';
import EmojiPickerComponent from '../../components/EmojiPicker';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  tokensUsed?: number;
}

function ChatPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [userTokens, setUserTokens] = useState(0);
  const [conversationMemory, setConversationMemory] = useState<ConversationMemory | undefined>(undefined);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [isIncognitoMode, setIsIncognitoMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadAvatars();
    loadUserTokens();
  }, []);

  useEffect(() => {
    if (selectedAvatar) {
      loadChatHistory();
    }
  }, [selectedAvatar]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedAvatar) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/keep-alive?avatarId=${selectedAvatar.id}`);
        const data = await res.json();
        if (data.shouldClose) {
          alert('La conversación ha finalizado por inactividad o timeout. Serás redirigido.');
          window.location.href = '/';
        }
      } catch (e) {
        // Silenciar errores de red
      }
    }, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, [selectedAvatar]);

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
    resetAccumulator(); // Resetear el acumulador
    
    // Actualizar avatar seleccionado
    setSelectedAvatar(newAvatar);
    
    // Mostrar indicador de cambio
    setAvatarChanged(true);
    setTimeout(() => setAvatarChanged(false), 3000); // Ocultar después de 3 segundos
    
    console.log(`[AVATAR] Contexto limpiado para ${newAvatar.name}`);
    
    // Cargar historial del nuevo avatar
    setTimeout(() => {
      loadChatHistory();
    }, 100); // Pequeño delay para asegurar que el avatar se ha actualizado
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
    if (!selectedAvatar) return;
    
    try {
      const response = await apiService.getChatHistory(50, 0, selectedAvatar.id);
      if (response.success && response.messages && response.messages.length > 0) {
        const formattedMessages = response.messages
          .filter((msg: any) => msg.content && msg.content.trim() !== '') // Solo mensajes con contenido
          .map((msg: { id: string; content: string; isUser: boolean; createdAt: string; tokensUsed?: number }) => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.isUser,
            timestamp: msg.createdAt,
            tokensUsed: msg.tokensUsed,
          }));
        
        // Solo establecer mensajes si hay mensajes válidos
        if (formattedMessages.length > 0) {
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  // Función que envía mensaje al backend (sin acumulación)
  const sendMessageToBackend = async (messageContent: string) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const conversationHistory = messages
        .filter(msg => msg.content && msg.content.trim() !== '')
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.content.trim()
        }));

      const chatMessage: ChatMessage = {
        message: messageContent,
        avatarId: selectedAvatar?.id,
        conversationMemory: conversationMemory || {},
        conversationHistory: conversationHistory,
        incognitoMode: isIncognitoMode,
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
        
        if (response.conversationMemory) {
          setConversationMemory(response.conversationMemory);
        }
        
        await loadUserTokens();
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('autenticado') || error.message.includes('sesión')) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
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

  // Hook de acumulación de mensajes
  const {
    sendWithAccumulation,
    handleTextareaChange,
    resetAccumulator,
    setTextareaRef
  } = useMessageAccumulator({
    onSendMessage: sendMessageToBackend,
    onShowMessage: (message) => {
      // Mostrar solo el mensaje individual en el frontend
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: message,
        isUser: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
    },
    isResponding: isLoading
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Usar el hook de acumulación
    await sendWithAccumulation(inputMessage);
    setInputMessage(''); // Limpiar textarea inmediatamente
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
        resetAccumulator(); // Resetear el acumulador
        console.log('[MEMORY] Memoria limpiada');
      }
    } catch (error) {
      console.error('Error limpiando historial:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // Si el timestamp es inválido, usar la hora actual
        return new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      // En caso de error, usar la hora actual
      return new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Función para procesar emojis en el contenido del mensaje
  const processEmojis = (content: string) => {
    // Regex para detectar emojis Unicode
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    
    return content.replace(emojiRegex, (emoji) => {
      return `<span style="font-size: 1.5em;">${emoji}</span>`;
    });
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 min-h-screen">
      {/* Header local unificado: selector de avatares + tokens + limpiar chat */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Estado de conexión y selector de avatares */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ConnectionStatus />
            </div>
            {/* Selector de avatares */}
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
          {/* Controles de tokens y limpiar chat */}
          <div className="flex items-center space-x-4 ml-4">
            <button
              onClick={() => setIsIncognitoMode(!isIncognitoMode)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                isIncognitoMode 
                  ? 'bg-green-500/30 text-green-200 border border-green-400/50' 
                  : 'bg-white/10 hover:bg-white/20 text-white/80'
              }`}
              title={isIncognitoMode ? "Desactivar modo incógnito" : "Activar modo incógnito"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isIncognitoMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
              <span>Incógnito</span>
            </button>
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

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 relative">
        {/* Avatar Image - Absolute positioned to the left */}
        {selectedAvatar && (
          <div className="absolute left-0 top-0 w-80 -ml-80">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 flex flex-col">
              <div className="w-72 h-96 rounded-lg overflow-hidden mt-4">
                <img
                  src={selectedAvatar.imageUrl}
                  alt={selectedAvatar.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold hidden">
                  {selectedAvatar.name[0]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Container - Centered as original */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl flex flex-col h-[80vh]">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ minHeight: 0 }}>
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
                {isIncognitoMode && (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-200 px-4 py-2 rounded-lg text-sm border border-green-400/50">
                      <span>🔒</span>
                      <span>Modo incógnito activado - Los mensajes no se guardarán</span>
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
                          <p 
                            className="text-sm leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: processEmojis(message.content) }}
                          />
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
              <div className="flex-1 relative flex items-center space-x-2">
                <textarea
                  ref={(ref) => {
                    textareaRef.current = ref;
                    setTextareaRef(ref);
                  }}
                  value={inputMessage}
                  onChange={(e) => {
                  const newValue = e.target.value;
                  setInputMessage(newValue);
                  handleTextareaChange(newValue);
                }}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-300"
                  rows={1}
                />
                <EmojiPickerComponent
                  onEmojiClick={(emoji: string) => {
                    const newValue = inputMessage + emoji;
                    setInputMessage(newValue);
                    handleTextareaChange(newValue);
                    // Devolver el foco al textarea después de insertar el emoji
                    setTimeout(() => {
                      textareaRef.current?.focus();
                    }, 100);
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
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

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatPageContent />
    </AuthGuard>
  );
} 