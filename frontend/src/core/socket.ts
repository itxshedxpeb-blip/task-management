import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/AuthContext';
import { config } from '@/lib/config';

let socket: Socket | null = null;

export function getSocket(userId?: string) {
  if (!socket && userId) {
    // Use backend URL from config, convert http/https to ws/wss
    const backendUrl = config.backendUrl;
    const socketUrl = backendUrl.replace(/^http/, 'ws');
    
    socket = io(`${socketUrl}/tasks`, {
      auth: { userId },
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function useTaskSocket() {
  const { user } = useAuth();
  
  if (user && !socket) {
    getSocket(user.id);
  }
  
  return socket;
}
