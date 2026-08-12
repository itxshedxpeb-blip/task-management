'use client';

import { useEffect } from 'react';

export function SafeAreaInsets() {
  useEffect(() => {
    const setSafeAreaInsets = () => {
      try {
        if (typeof document !== 'undefined' && document.documentElement) {
          const style = document.documentElement.style;
          const computedStyle = getComputedStyle(document.documentElement);
          const safeAreaTop = computedStyle.getPropertyValue('safe-area-inset-top') || '0px';
          const safeAreaRight = computedStyle.getPropertyValue('safe-area-inset-right') || '0px';
          const safeAreaBottom = computedStyle.getPropertyValue('safe-area-inset-bottom') || '0px';
          const safeAreaLeft = computedStyle.getPropertyValue('safe-area-inset-left') || '0px';
          
          style.setProperty('--safe-area-inset-top', safeAreaTop);
          style.setProperty('--safe-area-inset-right', safeAreaRight);
          style.setProperty('--safe-area-inset-bottom', safeAreaBottom);
          style.setProperty('--safe-area-inset-left', safeAreaLeft);
        }
      } catch (e) {
        console.warn('Failed to set safe area insets:', e);
      }
    };
    
    setSafeAreaInsets();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setSafeAreaInsets);
      return () => document.removeEventListener('DOMContentLoaded', setSafeAreaInsets);
    }
  }, []);

  return null;
}
