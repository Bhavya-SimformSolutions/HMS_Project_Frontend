import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { NotificationService } from "../../../core/services/notification.service";
import { Subscription } from "rxjs";
import { WebSocketService } from "../../../core/services/websocket.service";
@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  isWebSocketConnected = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeNotifications();
    this.subscribeToWebSocketStatus();
    this.subscribeToRealTimeNotifications();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Initialize notifications - fetch initial data and subscribe to real-time updates
   */
  private initializeNotifications(): void {
    // Subscribe to unread count changes (real-time updates included)
    const unreadSub = this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
      this.cdr.markForCheck();
    });
    this.subscriptions.push(unreadSub);

    // Fetch initial notifications
    this.fetchInitialNotifications();
  }

  /**
   * Fetch initial notifications from server
   */
  private fetchInitialNotifications(): void {
    const fetchSub = this.notificationService.getNotifications().subscribe({
      next: () => {
        console.log('✅ Initial notifications loaded');
      },
      error: (error) => {
        console.error('❌ Error loading initial notifications:', error);
      }
    });
    this.subscriptions.push(fetchSub);
  }

  /**
   * Subscribe to WebSocket connection status
   */
  private subscribeToWebSocketStatus(): void {
    const statusSub = this.webSocketService.getConnectionStatus().subscribe(isConnected => {
      this.isWebSocketConnected = isConnected;
      this.cdr.markForCheck();
      
      if (isConnected) {
        console.log('🔗 WebSocket connected - real-time notifications active');
      } else {
        console.log('❌ WebSocket disconnected - using polling fallback');
      }
    });
    this.subscriptions.push(statusSub);
  }

  /**
   * Subscribe to real-time notifications
   */
  private subscribeToRealTimeNotifications(): void {
    const notificationSub = this.notificationService.getCurrentNotifications().subscribe(notifications => {
      const unreadCount = notifications.filter(n => !n.isRead).length;
      if (this.unreadCount !== unreadCount) {
        this.unreadCount = unreadCount;
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.push(notificationSub);
  }
} 