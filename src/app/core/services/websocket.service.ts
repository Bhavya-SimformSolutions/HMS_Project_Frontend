import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, type Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: ReturnType<typeof io> | null = null;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private notificationSubject = new BehaviorSubject<RealtimeNotification | null>(null);

  // Public observables
  public connected$ = this.connectedSubject.asObservable();
  public newNotification$ = this.notificationSubject.asObservable();

  constructor() {
    console.log('WebSocketService initialized');
  }

  /**
   * Connect to WebSocket server with JWT authentication
   */
  public connect(): void {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No authentication token found, cannot connect to WebSocket');
      return;
    }

    if (this.socket?.connected) {
      console.log('Already connected to WebSocket server');
      return;
    }

    try {
      this.socket = io(environment.apiUrl, {
        auth: {
          token: token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      this.setupEventHandlers();
      
      console.log('Attempting to connect to WebSocket server...');
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting from WebSocket server');
      this.socket.disconnect();
      this.socket = null;
      this.connectedSubject.next(false);
    }
  }

  /**
   * Check if connected to WebSocket server
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Mark notification as read via WebSocket
   */
  public markNotificationRead(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('notification_read', notificationId);
      console.log(`Marked notification ${notificationId} as read via WebSocket`);
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.connectedSubject.next(true);
    });

    // Connection failed
    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ WebSocket connection error:', error.message);
      this.connectedSubject.next(false);
    });

    // Disconnected
    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Disconnected from WebSocket server:', reason);
      this.connectedSubject.next(false);
    });

    // Welcome message
    this.socket.on('connected', (data: any) => {
      console.log('🎉 WebSocket welcome message:', data);
    });

    // New notification received
    this.socket.on('new_notification', (notification: RealtimeNotification) => {
      console.log('🔔 New notification received:', notification);
      this.notificationSubject.next(notification);
    });

    // Role-based notification (for admin notifications)
    this.socket.on('role_notification', (data: { role: string, notification: RealtimeNotification }) => {
      const userRole = this.getUserRole();
      if (userRole === data.role) {
        console.log(`🔔 Role notification for ${data.role}:`, data.notification);
        this.notificationSubject.next(data.notification);
      }
    });

    // Broadcast notification
    this.socket.on('broadcast_notification', (notification: RealtimeNotification) => {
      console.log('📢 Broadcast notification received:', notification);
      this.notificationSubject.next(notification);
    });

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    // Reconnection successful
    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`✅ Reconnected to WebSocket server after ${attemptNumber} attempts`);
      this.connectedSubject.next(true);
    });

    // Reconnection failed
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect to WebSocket server');
      this.connectedSubject.next(false);
    });
  }

  /**
   * Get user role from token
   */
  private getUserRole(): string {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch (error) {
      console.error('Error extracting user role from token:', error);
      return '';
    }
  }

  /**
   * Get connection status as observable
   */
  public getConnectionStatus(): Observable<boolean> {
    return this.connected$;
  }

  /**
   * Get new notifications as observable
   */
  public getNewNotifications(): Observable<RealtimeNotification | null> {
    return this.newNotification$;
  }
}
