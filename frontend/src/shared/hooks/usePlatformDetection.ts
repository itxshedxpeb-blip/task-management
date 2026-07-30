"use client";

import { useMemo } from 'react';

export type Platform = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'unknown';
export type Browser = 'chrome' | 'edge' | 'safari' | 'firefox' | 'samsung' | 'unknown';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface PlatformInfo {
  platform: Platform;
  browser: Browser;
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsPWAInstall: boolean;
  supportsNativeInstall: boolean;
  installInstructions: string | null;
}

function getPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/win/.test(userAgent)) return 'windows';
  if (/mac/.test(userAgent)) return 'macos';
  if (/linux/.test(userAgent)) return 'linux';
  
  return 'unknown';
}

function getBrowser(): Browser {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/chrome/.test(userAgent) && !/edge|edg/.test(userAgent) && !/samsung/.test(userAgent)) return 'chrome';
  if (/edge|edg/.test(userAgent)) return 'edge';
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) return 'safari';
  if (/firefox/.test(userAgent)) return 'firefox';
  if (/samsung/.test(userAgent)) return 'samsung';
  
  return 'unknown';
}

function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  
  // Tablet detection
  const isTablet = /ipad|android(?!.*mobile)|tablet/.test(userAgent) || 
                   (screenWidth >= 768 && screenWidth <= 1024);
  
  // Mobile detection
  const isMobile = /mobile|android|iphone|ipod/.test(userAgent) || screenWidth < 768;
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
}

function getInstallInstructions(platform: Platform, browser: Browser): string | null {
  // iOS Safari - use native share sheet
  if (platform === 'ios' && browser === 'safari') {
    return 'Tap the Share button, then "Add to Home Screen"';
  }
  
  // iOS Chrome - not supported
  if (platform === 'ios' && browser !== 'safari') {
    return 'Open in Safari to install: Tap Share, then "Add to Home Screen"';
  }
  
  // Android Chrome/Edge - supports PWA install
  if (platform === 'android' && (browser === 'chrome' || browser === 'edge' || browser === 'samsung')) {
    return null; // Will use native install prompt
  }
  
  // Android other browsers - not supported
  if (platform === 'android') {
    return 'Open in Chrome to install this app';
  }
  
  // Desktop Chrome/Edge - supports PWA install
  if ((platform === 'windows' || platform === 'macos' || platform === 'linux') && 
      (browser === 'chrome' || browser === 'edge')) {
    return null; // Will use native install prompt
  }
  
  // Desktop Safari - not supported
  if ((platform === 'macos') && browser === 'safari') {
    return 'PWA installation not supported in Safari. Use Chrome or Edge.';
  }
  
  // Desktop Firefox - not supported
  if (browser === 'firefox') {
    return 'PWA installation not supported in Firefox. Use Chrome or Edge.';
  }
  
  return null;
}

export function usePlatformDetection(): PlatformInfo {
  const platform = useMemo(() => getPlatform(), []);
  const browser = useMemo(() => getBrowser(), []);
  const deviceType = useMemo(() => getDeviceType(), []);
  
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  
  // PWA install support
  const supportsPWAInstall = useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    // Desktop Chrome/Edge
    if (isDesktop && (browser === 'chrome' || browser === 'edge')) return true;
    
    // Android Chrome/Edge/Samsung
    if (isAndroid && (browser === 'chrome' || browser === 'edge' || browser === 'samsung')) return true;
    
    // iOS Safari - manual install only
    if (isIOS && browser === 'safari') return true;
    
    return false;
  }, [isDesktop, isAndroid, isIOS, browser]);
  
  // Native install prompt support (beforeinstallprompt)
  const supportsNativeInstall = useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    // Desktop Chrome/Edge
    if (isDesktop && (browser === 'chrome' || browser === 'edge')) return true;
    
    // Android Chrome/Edge/Samsung
    if (isAndroid && (browser === 'chrome' || browser === 'edge' || browser === 'samsung')) return true;
    
    return false;
  }, [isDesktop, isAndroid, browser]);
  
  const installInstructions = useMemo(() => 
    getInstallInstructions(platform, browser), 
    [platform, browser]
  );
  
  return {
    platform,
    browser,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    supportsPWAInstall,
    supportsNativeInstall,
    installInstructions,
  };
}
