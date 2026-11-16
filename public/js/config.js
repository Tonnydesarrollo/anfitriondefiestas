/**
 * config.js
 * Dynamic configuration for Frontend (Vercel) <-> Backend (Docker / VPS / Local)
 * Automatically detects backend URL from query parameter, localStorage, or same origin.
 */

(function () {
  'use strict';

  const urlParams = new URLSearchParams(window.location.search);
  const serverParam = urlParams.get('server');

  if (serverParam) {
    try {
      const cleanUrl = decodeURIComponent(serverParam).trim().replace(/\/$/, '');
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        localStorage.setItem('party_backend_url', cleanUrl);
      }
    } catch (e) {
      console.warn('[Config] Error parsing server param:', e);
    }
  }

  // Retrieve stored backend or fallback to deployed Docker backend / current origin
  const storedBackend = localStorage.getItem('party_backend_url');
  
  let targetBackend = storedBackend;
  if (!targetBackend) {
    if (window.location.hostname.includes('vercel.app')) {
      // Default to our live dockerized backend on 100.100.148.80
      targetBackend = 'https://outlets-settings-packard-secretariat.trycloudflare.com';
    } else {
      targetBackend = window.location.origin;
    }
  }

  window.PARTY_BACKEND_URL = targetBackend || '';
  console.log('[Config] Party Backend Target URL:', window.PARTY_BACKEND_URL || '(Mismo origen)');
})();
