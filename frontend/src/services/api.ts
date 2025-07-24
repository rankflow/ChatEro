const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ConversationMemory {
  summary?: string;
  turnCount?: number;
  lastUpdated?: string;
  userRevelations?: string[];
  dominantTone?: string;
  avatarIntroduced?: boolean;
  boundariesDiscussed?: string[];
  fantasiesExplored?: string[];
}

export interface ChatMessage {
  message: string;
  avatarId?: string;
  context?: string;
  incognitoMode?: boolean;
  conversationMemory?: ConversationMemory;
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  timestamp: string;
  messageId: string;
  tokensUsed: number;
  conversationMemory?: ConversationMemory;
}

export interface Avatar {
  id: string;
  name: string;
  description: string;
  personality: string;
  imageUrl: string;
  isPremium: boolean;
  category: string;
  isActive: boolean;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Autenticación
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error en el login: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  async register(credentials: { email: string; password: string; username: string }): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Error en el registro');
    }

    const data = await response.json();
    if (data.success && data.token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Chat
  async sendMessage(chatMessage: ChatMessage): Promise<ChatResponse> {
    try {
      // Verificar autenticación antes de enviar
      if (!this.isAuthenticated()) {
        throw new Error('No estás autenticado. Por favor, inicia sesión.');
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(chatMessage),
      });

      console.log('[DEBUG] Status de respuesta:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado o inválido
          console.log('[DEBUG] Error 401 - Token expirado');
          this.logout(); // Limpiar datos de sesión
          throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para enviar mensajes.');
        } else {
          const errorText = await response.text();
          console.log('[DEBUG] Error response:', errorText);
          throw new Error(`Error enviando mensaje: ${response.status} - ${errorText}`);
        }
      }

      return response.json();
    } catch (error) {
      console.error('[API] Error en sendMessage:', error);
      throw error;
    }
  }

  async getChatHistory(limit: number = 50, offset: number = 0): Promise<{ success: boolean; messages: any[]; total: number }> {
    const response = await fetch(
      `${API_BASE_URL}/api/chat/history?limit=${limit}&offset=${offset}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error obteniendo historial');
    }

    return response.json();
  }

  async clearChatHistory(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error limpiando historial');
    }

    return response.json();
  }

  // Avatares
  async getAvatars(): Promise<{ success: boolean; avatars: Avatar[] }> {
    const response = await fetch(`${API_BASE_URL}/api/avatars`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo avatares');
    }

    return response.json();
  }

  async getAvatarById(avatarId: string): Promise<{ success: boolean; avatar: Avatar }> {
    const response = await fetch(`${API_BASE_URL}/api/avatars/${avatarId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo avatar');
    }

    return response.json();
  }

  async getAvatarProfile(avatarId: string): Promise<{ success: boolean; profile: any }> {
    const response = await fetch(`${API_BASE_URL}/api/avatars/${avatarId}/profile`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo perfil del avatar');
    }

    return response.json();
  }

  // Tokens
  async getUserTokens(): Promise<{ success: boolean; tokens: number }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/tokens`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo tokens');
    }

    return response.json();
  }

  // Análisis Batch
  async batchAnalyze(avatarId: string): Promise<{ success: boolean; message: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/api/chat/batch-analyze`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ avatarId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ejecutando análisis batch: ${response.status}`);
    }

    return response.json();
  }

  async getConversationStatus(avatarId: string): Promise<{
    success: boolean;
    conversationEnded: boolean;
    timeSinceLastMessage: number;
    conversationDuration: number;
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/chat/conversation-status?avatarId=${avatarId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error obteniendo estado de conversación: ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService(); 