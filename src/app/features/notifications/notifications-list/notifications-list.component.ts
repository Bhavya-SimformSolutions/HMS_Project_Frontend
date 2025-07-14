import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NotificationService , Notification} from "../../../core/services/notification.service";
import { SidebarComponent } from "../../../layout/sidebar/sidebar.component";
import { Subscription } from "rxjs";
import { WebSocketService } from "../../../core/services/websocket.service";
@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule,RouterModule, SidebarComponent],
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.css']
})
export class NotificationsListComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = true;
  isWebSocketConnected = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.initializeNotifications();
    this.subscribeToWebSocketStatus();
    this.subscribeToRealTimeUpdates();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Initialize notifications
   */
  private initializeNotifications(): void {
    this.loading = true;
    const fetchSub = this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
        console.log('✅ Notifications loaded:', notifications.length);
      },
      error: (error) => {
        console.error('❌ Error loading notifications:', error);
        this.loading = false;
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
    });
    this.subscriptions.push(statusSub);
  }

  /**
   * Subscribe to real-time notification updates
   */
  private subscribeToRealTimeUpdates(): void {
    const updatesSub = this.notificationService.getCurrentNotifications().subscribe(notifications => {
      this.notifications = notifications;
      console.log('🔄 Notifications updated via real-time:', notifications.length);
    });
    this.subscriptions.push(updatesSub);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          console.log('✅ Notification marked as read:', notification.id);
        },
        error: (error) => {
          console.error('❌ Error marking notification as read:', error);
        }
      });
    }
  }

  /**
   * Refresh notifications manually
   */
  refreshNotifications(): void {
    this.notificationService.refreshNotifications();
  }
} 