"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePlatformDetection, PlatformInfo } from './usePlatformDetection';

export type InstallState = 
  | 'idle' 
  | 'available' 
  | 'installing' 
  | 'installed' 
  | 'dismissed' 
  | 'not-supported'
  | 'error';

export interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isInstalling: boolean;
  installState: InstallState;
  platformInfo: PlatformInfo;
  install: () => Promise<void>;
  dismiss: () => void;
  reset: () => void;
  error: string | null;
}

export function usePWAInstall(): PWAInstallState {
  const platformInfo = usePlatformDetection();
  const [installState, setInstallState] = useState<InstallState>('idle');
  const [error, setError] = useState<string | null>(null);
  const deferredPromptRef = useRef<any>(null);
  const dismissedRef = useRef(false);

  // Check if already installed (standalone mode)
  const isInstalled = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  })[0];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      if (isStandalone && installState === 'idle') {
        setInstallState('installed');
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      
      if (!dismissedRef.current && !isInstalled) {
        setInstallState('available');
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setInstallState('installed');
      deferredPromptRef.current = null;
      dismissedRef.current = false;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', checkInstalled);
    };
  }, [installState, isInstalled]);

  // Update state based on platform support
  useEffect(() => {
    if (isInstalled) {
      setInstallState('installed');
      return;
    }

    if (dismissedRef.current) {
      setInstallState('dismissed');
      return;
    }

    if (!platformInfo.supportsPWAInstall) {
      setInstallState('not-supported');
      return;
    }

    // If we have a deferred prompt and not dismissed, show as available
    if (deferredPromptRef.current && !dismissedRef.current) {
      setInstallState('available');
    } else if (!platformInfo.supportsNativeInstall && platformInfo.supportsPWAInstall) {
      // iOS Safari - show available for manual install
      setInstallState('available');
    } else {
      setInstallState('idle');
    }
  }, [platformInfo, isInstalled]);

  const install = useCallback(async () => {
    setError(null);
    
    if (installState === 'installed') {
      return;
    }

    if (installState === 'not-supported') {
      setError('PWA installation is not supported on this device/browser.');
      return;
    }

    if (!platformInfo.supportsNativeInstall) {
      // iOS Safari - show instructions
      setInstallState('installing');
      // The UI component will show instructions
      setTimeout(() => {
        setInstallState('available');
      }, 3000);
      return;
    }

    // Native install (Chrome/Edge on Desktop/Android)
    if (deferredPromptRef.current) {
      setInstallState('installing');
      
      try {
        deferredPromptRef.current.prompt();
        const { outcome } = await deferredPromptRef.current.userChoice;
        
        if (outcome === 'accepted') {
          setInstallState('installed');
          deferredPromptRef.current = null;
          dismissedRef.current = false;
        } else {
          setInstallState('dismissed');
          dismissedRef.current = true;
        }
      } catch (err) {
        setError('Installation failed. Please try again.');
        setInstallState('error');
      }
    } else {
      setError('Install prompt not available. Please refresh the page.');
      setInstallState('error');
    }
  }, [installState, platformInfo]);

  const dismiss = useCallback(() => {
    dismissedRef.current = true;
    setInstallState('dismissed');
    deferredPromptRef.current = null;
  }, []);

  const reset = useCallback(() => {
    dismissedRef.current = false;
    setError(null);
    setInstallState('idle');
  }, []);

  const canInstall = installState === 'available' && !isInstalled;
  const isInstalling = installState === 'installing';

  return {
    canInstall,
    isInstalled,
    isInstalling,
    installState,
    platformInfo,
    install,
    dismiss,
    reset,
    error,
  };
}
