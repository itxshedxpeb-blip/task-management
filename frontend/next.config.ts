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
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '10.0.2.2',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/:path*',
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
