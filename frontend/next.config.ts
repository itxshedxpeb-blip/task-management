import type { NextConfig } from "next";
import withPWA from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  allowedDevOrigins: ['127.0.0.1', '10.0.2.2'],
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.IMAGE_HOSTNAME || '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  compress: true,
  poweredByHeader: false,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error('BACKEND_URL environment variable is required');
    }
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
  // Do NOT generate a service-worker file – a minimal cleanup SW
  // lives in public/sw.js to tear down any stale previous installs.
  buildExcludes: [/middleware-manifest\.json$/, /icon\.svg$/, /_buildManifest\.js$/, /sw\.js$/],
});

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// @ts-ignore - Type incompatibility between next-pwa and @next/bundle-analyzer is a known issue
export default bundleAnalyzerConfig(pwaConfig(nextConfig as unknown as Parameters<typeof withPWA>[0]));
