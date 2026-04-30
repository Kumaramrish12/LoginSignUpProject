import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  getPendingUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pending-users`);
  }

  approveUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/approve-user`, data);
  }
}