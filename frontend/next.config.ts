import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Forzar redeploy
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
