import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  compress: true,
  poweredByHeader: false,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'https://task-management-backend-v2mh.onrender.com';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production',
  buildExcludes: [/middleware-manifest\.json$/],
});

export default pwaConfig(nextConfig as unknown as Parameters<typeof withPWA>[0]);
