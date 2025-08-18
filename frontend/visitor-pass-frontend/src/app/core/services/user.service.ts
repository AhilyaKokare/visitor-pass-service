import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private getApiUrl(tenantId: number) {
    return `${environment.apiUrl}/tenants/${tenantId}/admin`;
  }

  constructor(private http: HttpClient) { }

  getUsers(tenantId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.getApiUrl(tenantId)}/users`);
  }

  // THIS IS THE METHOD WE WILL BE USING
  createUser(tenantId: number, userData: any): Observable<User> {
    return this.http.post<User>(`${this.getApiUrl(tenantId)}/users`, userData);
  }

  updateUserStatus(tenantId: number, userId: number, isActive: boolean): Observable<User> {
    return this.http.put<User>(`${this.getApiUrl(tenantId)}/users/${userId}/status`, { isActive });
  }
}
