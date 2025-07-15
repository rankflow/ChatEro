import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { Heart } from 'lucide-react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat Ero - Chat IA + Avatares Eróticos",
  description: "Descubre una nueva forma de interactuar con inteligencia artificial. Elige tu avatar favorito y disfruta de conversaciones únicas y personalizadas.",
  keywords: ["chat", "ia", "avatars", "erótico", "inteligencia artificial"],
  authors: [{ name: "Chat Ero Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Header global */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Heart className="h-8 w-8 text-pink-500" />
                <span className="text-2xl font-bold text-gray-900">Chat Ero</span>
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/#features" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Características
                </Link>
                <Link href="/#pricing" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Precios
                </Link>
                <Link href="/#legal" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Legal
                </Link>
              </nav>
              <div className="flex space-x-4">
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-pink-500 transition-colors px-4 py-2 rounded-lg flex items-center"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/register" 
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
