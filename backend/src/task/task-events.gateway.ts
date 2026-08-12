import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export type TaskEventType =
  | 'task:created'
  | 'task:updated'
  | 'task:completed'
  | 'task:deleted';

export interface TaskSocketEvent {
  event: TaskEventType;
  taskId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task?: Record<string, any>;
  at: string;
}

@Injectable()
@WebSocketGateway({
  namespace: '/tasks',
  cors: { origin: true, credentials: true },
})
export class TaskEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server?: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      client.join(`user:${userId}`);
    }
    client.join('tasks');
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      client.leave(`user:${userId}`);
    }
  }

  emit(event: string, payload: any) {
    if (!this.server) return;
    const eventData = { event, ...payload, at: new Date().toISOString() };

    // Broadcast to all tasks room
    this.server.to('tasks').emit(event, eventData);

    // Also emit to specific assigned user if provided
    if (payload.assignedUserId) {
      this.server.to(`user:${payload.assignedUserId}`).emit(event, eventData);
    }
  }
}
