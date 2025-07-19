import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración compatible con Turbopack
  experimental: {
    // forceSwcTransforms: true, // Comentado para compatibilidad con Turbopack
  },
};

export default nextConfig;
