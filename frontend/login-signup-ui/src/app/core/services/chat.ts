import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:5000/api/chat';

  constructor(private http: HttpClient) {}

  sendMessage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, data);
  }

  getMessages(senderEmail: string, receiverEmail: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/messages?senderEmail=${senderEmail}&receiverEmail=${receiverEmail}`
    );
  }
}