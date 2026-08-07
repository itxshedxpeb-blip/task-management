/**
 * Centralized configuration management
 * Handles environment-specific settings for web, Android, and iOS
 */

export type Environment = 'development' | 'staging' | 'production';

export interface AppConfig {
  environment: Environment;
  apiUrl: string;
  capabilitiesPath: string;
  backendUrl: string;
  imageHostname: string;
  capacitorServerUrl?: string;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  apiTimeout: number;
}

function getEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development';
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
}

function getConfig(): AppConfig {
  const environment = getEnvironment();
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const imageHostname = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME;
  const capacitorServerUrl = process.env.NEXT_PUBLIC_CAPACITOR_SERVER_URL;
  
  // For Capacitor/Android builds, always use production URLs
  const isCapacitorBuild = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
  
  if (isCapacitorBuild) {
    return {
      environment: 'production',
      apiUrl: 'https://task-management-w4ai-swart.vercel.app/api',
      capabilitiesPath: '/system/capabilities',
      backendUrl: 'https://task-management-backend-v2mh.onrender.com',
      imageHostname: 'task-management-backend-v2mh.onrender.com',
      capacitorServerUrl: 'https://task-management-w4ai-swart.vercel.app',
      enableAnalytics: false,
      enableCrashReporting: false,
      apiTimeout: 30000,
    };
  }
  
  if (!backendUrl && environment === 'production') {
    throw new Error('NEXT_PUBLIC_BACKEND_URL environment variable is required in production');
  }
  
  if (!imageHostname && environment === 'production') {
    throw new Error('NEXT_PUBLIC_IMAGE_HOSTNAME environment variable is required in production');
  }
  
  // In development, provide fallbacks only if not set
  if (environment === 'development') {
    return {
      environment,
      apiUrl: apiBaseUrl,
      capabilitiesPath: process.env.NEXT_PUBLIC_CAPABILITIES_PATH || '/system/capabilities',
      backendUrl: backendUrl || 'http://127.0.0.1:8000',
      imageHostname: imageHostname || 'localhost',
      capacitorServerUrl,
      enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      enableCrashReporting: process.env.NEXT_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
      apiTimeout: 30000,
    };
  }
  
  // In production, no fallbacks - require all environment variables
  return {
    environment,
    apiUrl: apiBaseUrl,
    capabilitiesPath: process.env.NEXT_PUBLIC_CAPABILITIES_PATH || '/system/capabilities',
    backendUrl: backendUrl!,
    imageHostname: imageHostname!,
    capacitorServerUrl,
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableCrashReporting: process.env.NEXT_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
    apiTimeout: 30000,
  };
}

export const config = getConfig();

export const isDevelopment = config.environment === 'development';
export const isStaging = config.environment === 'staging';
export const isProduction = config.environment === 'production';

export const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
export const isAndroid = isCapacitor && (window as any).Capacitor.getPlatform() === 'android';
export const isIOS = isCapacitor && (window as any).Capacitor.getPlatform() === 'ios';
export const isWeb = !isCapacitor;

export function getApiBaseUrl(): string {
  if (isCapacitor && config.capacitorServerUrl) {
    // In Capacitor, use the server URL with /api prefix for Next.js rewrites
    return `${config.capacitorServerUrl}/api`;
  }
  return config.apiUrl;
}

export function getFullApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
