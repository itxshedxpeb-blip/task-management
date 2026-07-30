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
  install: () => Promise<void>;
  dismiss: () => void;
  reset: () => void;
  error: string | null;
  platformInfo: PlatformInfo;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

export function usePWAInstall(): PWAInstallState {
  const platformInfo = usePlatformDetection();
  const [installState, setInstallState] = useState<InstallState>(() => {
    if (isStandalone()) return 'installed';
    if (!platformInfo.supportsPWAInstall) return 'not-supported';
    return 'idle';
  });
  const [error, setError] = useState<string | null>(null);
  const deferredPromptRef = useRef<any>(null);
  const dismissedRef = useRef(false);

  const isInstalled = isStandalone();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      if (!dismissedRef.current && !isStandalone()) {
        setInstallState('available');
      }
    };

    const handleAppInstalled = () => {
      setInstallState('installed');
      deferredPromptRef.current = null;
      dismissedRef.current = false;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    setError(null);

    if (isStandalone()) return;

    if (installState === 'not-supported') {
      setError('PWA installation is not supported on this device/browser.');
      return;
    }

    if (!platformInfo.supportsNativeInstall) {
      setInstallState('installing');
      setTimeout(() => setInstallState('available'), 3000);
      return;
    }

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
      } catch {
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
    deferredPromptRef.current = null;
    setInstallState(isStandalone() ? 'installed' : 'idle');
  }, []);

  const canInstall = installState === 'available' && !isStandalone();
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
