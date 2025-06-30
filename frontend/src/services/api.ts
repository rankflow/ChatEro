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

export interface ChatMessage {
  message: string;
  avatarId?: string;
  context?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  timestamp: string;
  messageId: string;
  tokensUsed: number;
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
    const token = localStorage.getItem('authToken');
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
      throw new Error('Error en el login');
    }

    const data = await response.json();
    if (data.success && data.token) {
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
    if (data.success && data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Chat
  async sendMessage(chatMessage: ChatMessage): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(chatMessage),
    });

    if (!response.ok) {
      throw new Error('Error enviando mensaje');
    }

    return response.json();
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
}

export const apiService = new ApiService(); 