import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from "@angular/core";
import { NotificationService } from "../../../core/services/notification.service";

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBadgeComponent implements OnInit {
  unreadCount = 0;

  constructor(private notificationService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchUnread();
    setInterval(() => this.fetchUnread(), 15000); // Poll every 15s
  }

  fetchUnread() {
    this.notificationService.getNotifications(true).subscribe(
      notifications => {
        this.unreadCount = notifications.length;
        this.cdr.markForCheck();
      }
    );
  }
} 