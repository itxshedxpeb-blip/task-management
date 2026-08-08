'use client';

import { useEffect } from 'react';

export function GlobalErrorHandlers() {
  useEffect(() => {
    // Handle global JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      // Log to error tracking service (Sentry, etc.) in production
      if (process.env.NODE_ENV === 'production') {
        // TODO: Send to error tracking service
        console.error('Production error:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Log to error tracking service in production
      if (process.env.NODE_ENV === 'production') {
        // TODO: Send to error tracking service
        console.error('Production unhandled rejection:', {
          reason: event.reason,
          promise: event.promise,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Prevent default browser error logging
      event.preventDefault();
    };

    // Handle chunk loading errors
    const handleChunkError = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLScriptElement) {
        console.error('Chunk loading error:', target.src);
        
        // Reload page to recover from chunk loading failure
        if (process.env.NODE_ENV === 'production') {
          console.warn('Chunk loading failed, reloading page...');
          window.location.reload();
        }
      } else if (target instanceof HTMLLinkElement) {
        console.error('Chunk loading error:', target.href);
        
        // Reload page to recover from chunk loading failure
        if (process.env.NODE_ENV === 'production') {
          console.warn('Chunk loading failed, reloading page...');
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleChunkError, true);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleChunkError, true);
    };
  }, []);

  return null;
}
