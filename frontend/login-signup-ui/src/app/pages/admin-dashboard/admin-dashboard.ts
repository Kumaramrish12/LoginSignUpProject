import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent implements OnInit {

  activeTab = 'A';

  pendingUsers: any[] = [];

  noticeMessage = '';
  selectedReceiver = 'All Users';
  users: any[] = [];
  noticeHistory: any[] = [];

  totalAdmins = 0;
  totalUsers = 0;
  pendingCount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPendingUsers();
    this.loadAllUsers();
    this.loadAnalytics();
    this.loadNoticeHistory();
  }

  // ================= TAB SWITCH =================

  setTab(tab: string) {
    this.activeTab = tab;
  }


  // ================= TAB A =================
  // LOAD PENDING USERS

  loadPendingUsers() {

    this.http
      .get<any[]>('http://localhost:5000/api/admin/pending-users')
      .subscribe(res => {

        console.log('Pending Users:', res);

        this.pendingUsers = res;

      });

  }


  approveUser(user: any) {

    this.http
      .put(
        `http://localhost:5000/api/admin/approve-user/${user._id}`,
        {}
      )
      .subscribe(() => {

        this.loadPendingUsers();
        this.loadAnalytics();

      });

  }


  rejectUser(user: any) {

    this.http
      .delete(
        `http://localhost:5000/api/admin/delete-user/${user._id}`
      )
      .subscribe(() => {

        this.loadPendingUsers();
        this.loadAnalytics();

      });

  }


  // ================= TAB B =================
  // LOAD USERS FOR DROPDOWN

  loadAllUsers() {

    this.http
      .get<any>('http://localhost:5000/api/dashboard/total-users')
      .subscribe();

  }


  // SEND NOTICE

  sendNotice() {

    if (!this.noticeMessage.trim()) return;

    const notice = {

      sender: 'Admin',
      receiver: this.selectedReceiver,
      message: this.noticeMessage,
      timestamp: new Date()

    };

    this.http
      .post('http://localhost:5000/api/chat/send', notice)
      .subscribe(() => {

        this.noticeMessage = '';
        this.loadNoticeHistory();

      });

  }


  // LOAD NOTICE HISTORY

  loadNoticeHistory() {

    this.http
      .get<any[]>('http://localhost:5000/api/chat/messages')
      .subscribe(res => {

        this.noticeHistory = res;

      });

  }


  // ================= TAB C =================
  // ANALYTICS

  loadAnalytics() {

    this.http
      .get<any>('http://localhost:5000/api/dashboard/total-users')
      .subscribe(res => {

        this.totalAdmins = res.totalAdmins;
        this.totalUsers = res.totalUsers;
        this.pendingCount = res.pendingUsers;

      });

  }


  // ================= LOGOUT =================

  logout() {

    localStorage.clear();
    location.href = '/login';

  }

}