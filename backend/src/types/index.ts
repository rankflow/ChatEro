// Tipos para el backend

// Declaración de módulo para extender FastifyInstance
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
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
  
  // Desarrollo creativo del personaje
  background?: string;
  origin?: string;
  age?: number;
  occupation?: string;
  interests?: string;
  fears?: string;
  dreams?: string;
  secrets?: string;
  relationships?: string;
  lifeExperiences?: string;
  personalityTraits?: string;
  communicationStyle?: string;
  emotionalState?: string;
  motivations?: string;
  conflicts?: string;
  growth?: string;
  
  // Metadatos del personaje
  voiceType?: string;
  accent?: string;
  mannerisms?: string;
  style?: string;
  scent?: string;
  
  // Configuración del chat
  chatStyle?: string;
  topics?: string;
  boundaries?: string;
  kinks?: string;
  roleplay?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  avatarId?: string;
  content: string;
  isUser: boolean;
  tokensUsed: number;
  createdAt: Date;
}

export interface Token {
  id: string;
  userId: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  stripeId?: string;
  description?: string;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Tipos para requests
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChatMessageRequest {
  message: string;
  avatarId?: string;
  context?: string;
}

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  paymentMethod: 'tokens' | 'subscription';
  packageId?: string;
}

// Tipos para responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
  messageId: string;
  tokensUsed: number;
}

export interface PaymentIntentResponse {
  paymentIntent: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    client_secret: string;
    payment_method_types: string[];
    metadata: Record<string, any>;
  };
} 