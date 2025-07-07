import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { SIDEBAR_LINKS } from './sidebar-links';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationBadgeComponent } from '../../features/notifications/notification-badge/notification-badge.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule,NotificationBadgeComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  sidebarLinks = SIDEBAR_LINKS;
  role: string = '';
  section: any;
  link: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    // Get the user's role
    this.role = this.authService.getRole();
  }

  // Check if the user has access to a specific link
  hasAccess(access: string[]): boolean {
    const hasAccess = access.includes(this.role);
    return hasAccess;
  }

  // Logout method
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
