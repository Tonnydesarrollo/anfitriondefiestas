// Runtime backend configuration (supports single-origin Docker/Node or split Vercel + Cloud Tunnel)
window.PARTY_BACKEND_URL = window.PARTY_BACKEND_URL || '';
export const BACKEND_URL = window.PARTY_BACKEND_URL;
export const POLL_OPTIONS = { transports: ['websocket', 'polling'] };
