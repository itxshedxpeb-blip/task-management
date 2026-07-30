import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';
import { config } from './src/lib/config';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  allowedDevOrigins: ['10.0.2.2', '10.0.3.2'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
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
  disable: config.environment === 'development',
});

// @ts-ignore
export default withBundleAnalyzer(pwaConfig(nextConfig));
