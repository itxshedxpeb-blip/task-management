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
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none',
        });

        swRefRef.current = registration;

        // Check for updates immediately
        registration.update();

        // Listen for updates
        registration.addEventListener('updatefound', handleUpdateFound);

        // Listen for controller changes
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        // Check if a service worker is already waiting
        if (registration.waiting) {
          handleUpdateFound();
        }

        // Periodic update check (every hour)
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

    const handleUpdateFound = () => {
      const registration = swRefRef.current;
      if (!registration) return;

      const newWorker = registration.installing;
      if (!newWorker) return;

      setState('installing');
      setIsUpdateAvailable(true);

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && registration.active) {
          // New SW installed but old SW still active
          setState('waiting');
          setIsWaiting(true);
          waitingSwRef.current = newWorker;
        } else if (newWorker.state === 'activated') {
          // New SW is now active
          setState('activated');
          setIsWaiting(false);
          setIsUpdateAvailable(false);
          waitingSwRef.current = null;
        } else if (newWorker.state === 'redundant') {
          // Installation failed
          setState('error');
          setError('Service worker installation failed');
        }
      });
    };

    const handleControllerChange = () => {
      // New service worker took control
      setState('activated');
      setIsWaiting(false);
      setIsUpdateAvailable(false);
      waitingSwRef.current = null;
      
      // Reload the page to get fresh content
      window.location.reload();
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
      // Send message to waiting SW to skip waiting
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
