import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  allowedDevOrigins: ['127.0.0.1', '10.0.2.2'],
  images: {
    unoptimized: true,
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
  register: false,
  skipWaiting: true,
  disable: true,
  buildExcludes: [/middleware-manifest\.json$/, /icon\.svg$/, /_buildManifest\.js$/],
});

export default pwaConfig(nextConfig as unknown as Parameters<typeof withPWA>[0]);
