'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
        reg.update();
      } catch (err) {
        console.warn('[SW] Registration failed:', err);
      }
    };

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);
}
