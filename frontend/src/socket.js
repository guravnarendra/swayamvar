import { io } from 'socket.io-client';

// Generate or retrieve a persistent device identifier across refreshes
function getDeviceId() {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('swayamvar_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('swayamvar_device_id', id);
  }
  return id;
}

// BACKEND URL RESOLUTION:
// 1. In local development (Vite dev server on port 3000):
//    Connect to port 4000 using window.location.hostname!
//    This allows mobile phones on Wi-Fi (e.g. http://192.168.1.5:3000) to connect
//    to http://192.168.1.5:4000 instead of failing on phone's localhost!
// 2. In production (Render/single service):
//    Connect to window.location.origin (same host and port).
const BACKEND_URL = window.location.port === '3000'
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : window.location.origin;

export const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'], // Fallback support for strict mobile networks
  auth: {
    deviceId: getDeviceId(),
  },
});

// Explicitly close socket when user refreshes or closes the tab
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    try {
      socket.disconnect();
    } catch (_e) {}
  });

  window.addEventListener('pagehide', () => {
    try {
      socket.disconnect();
    } catch (_e) {}
  });
}
