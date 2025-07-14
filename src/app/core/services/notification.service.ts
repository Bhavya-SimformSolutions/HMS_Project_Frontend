import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { environment } from "../../../environments/environment";
import { WebSocketService, RealtimeNotification } from "./websocket.service";

export interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = `${environment.apiUrl}/notifications`;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  // Public observables
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService
  ) {
    this.initializeRealtimeNotifications();
  }

  private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }

  /**
   * Initialize real-time notification handling
   */
  private initializeRealtimeNotifications(): void {
    // Listen for new real-time notifications
    this.webSocketService.getNewNotifications().subscribe(notification => {
      if (notification) {
        this.addNewNotification(notification);
      }
    });
  }

  /**
   * Add new notification to the list and update counts
   */
  private addNewNotification(notification: RealtimeNotification): void {
    const currentNotifications = this.notificationsSubject.value;
    const newNotifications = [notification, ...currentNotifications];
    
    this.notificationsSubject.next(newNotifications);
    this.updateUnreadCount(newNotifications);
    
    console.log('✅ Added new real-time notification to list');
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Get notifications (REST API with real-time updates)
   */
  getNotifications(unreadOnly = false): Observable<Notification[]> {
    return this.http.get<{ notifications: Notification[] }>(`${this.baseUrl}?unread=${unreadOnly}`,{
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const notifications = res.notifications;
        if (!unreadOnly) {
          // Update our local state with fetched notifications
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount(notifications);
        }
        return notifications;
      })
    );
  }

  /**
   * Mark notification as read (with real-time update)
   */
  markAsRead(id: string): Observable<Notification> {
    // Update local state immediately
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);

    // Send via WebSocket for real-time update
    this.webSocketService.markNotificationRead(id);

    // Also update via REST API as backup
    return this.http.patch<Notification>(
      `${this.baseUrl}/${id}/read`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get current unread count
   */
  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  /**
   * Get current notifications list
   */
  getCurrentNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  /**
   * Force refresh notifications from server
   */
  refreshNotifications(): void {
    this.getNotifications().subscribe();
  }
}