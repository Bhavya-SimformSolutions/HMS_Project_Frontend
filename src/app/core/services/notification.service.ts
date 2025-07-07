import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../environments/environment";

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

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }

  getNotifications(unreadOnly = false): Observable<Notification[]> {
    return this.http.get<{ notifications: Notification[] }>(`${this.baseUrl}?unread=${unreadOnly}`,{
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => res.notifications)
    );
  }

   markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(
      `${this.baseUrl}/${id}/read`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
}