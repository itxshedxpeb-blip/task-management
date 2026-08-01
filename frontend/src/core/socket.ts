import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/AuthContext';

let socket: Socket | null = null;

export function getSocket(userId?: string) {
  if (!socket && userId) {
    socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/tasks`, {
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
