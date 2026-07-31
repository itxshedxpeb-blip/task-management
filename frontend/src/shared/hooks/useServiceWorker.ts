"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export type SWState = 'idle' | 'installing' | 'waiting' | 'activated' | 'error';

export interface ServiceWorkerState {
  state: SWState;
  isUpdateAvailable: boolean;
  isWaiting: boolean;
  update: () => Promise<void>;
  skipWaiting: () => Promise<void>;
  error: string | null;
}

export function useServiceWorker(): ServiceWorkerState {
  const [state, setState] = useState<SWState>('idle');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const swRefRef = useRef<ServiceWorkerRegistration | null>(null);
  const waitingSwRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    // Disable service worker in development or if not supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || process.env.NODE_ENV === 'development') {
      return;
    }

    // Temporarily disable service worker for debugging
    return;

    const handleUpdateFound = () => {
      const registration = swRefRef.current;
      if (!registration) return;

      const newWorker = registration.installing;
      if (!newWorker) return;

      setState('installing');
      setIsUpdateAvailable(true);

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && registration.active) {
          setState('waiting');
          setIsWaiting(true);
          waitingSwRef.current = newWorker;
        } else if (newWorker.state === 'activated') {
          setState('activated');
          setIsWaiting(false);
          setIsUpdateAvailable(false);
          waitingSwRef.current = null;
        } else if (newWorker.state === 'redundant') {
          setState('error');
          setError('Service worker installation failed');
        }
      });
    };

    const handleControllerChange = () => {
      setState('activated');
      setIsWaiting(false);
      setIsUpdateAvailable(false);
      waitingSwRef.current = null;
      window.location.reload();
    };

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none',
        });

        swRefRef.current = registration;
        registration.update();
        registration.addEventListener('updatefound', handleUpdateFound);
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        if (registration.waiting) {
          handleUpdateFound();
        }

        const intervalId = setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        return () => {
          registration.removeEventListener('updatefound', handleUpdateFound);
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          clearInterval(intervalId);
        };
      } catch (err) {
        setError('Service worker registration failed');
        console.error('SW registration failed:', err);
      }
    };

    registerSW();
  }, []);

  const update = useCallback(async () => {
    const registration = swRefRef.current;
    if (!registration) return;

    try {
      await registration.update();
    } catch (err) {
      setError('Failed to check for updates');
      console.error('SW update failed:', err);
    }
  }, []);

  const skipWaiting = useCallback(async () => {
    const waitingWorker = waitingSwRef.current;
    if (!waitingWorker) return;

    try {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } catch (err) {
      setError('Failed to activate new version');
      console.error('SW skip waiting failed:', err);
    }
  }, []);

  return {
    state,
    isUpdateAvailable,
    isWaiting,
    update,
    skipWaiting,
    error,
  };
}