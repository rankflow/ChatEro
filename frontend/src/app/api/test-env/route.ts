import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NO_CONFIGURADA',
    stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'CONFIGURADA' : 'NO_CONFIGURADA',
    timestamp: new Date().toISOString()
  });
} 