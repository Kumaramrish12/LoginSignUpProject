import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
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

  chart: any;

  // 🔥 NEW (for direct users)
  usersList: string[] = [];
  currentUserEmail = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPendingUsers();
    this.loadAllUsers();
    this.loadAnalytics();
    this.loadNoticeHistory();

    // 🔥 NEW
    this.currentUserEmail = localStorage.getItem('email') || '';
    this.loadUsers();
  }

  // ================= NEW: LOAD USERS =================

  loadUsers() {
    this.http.get<string[]>('http://localhost:5000/api/users')
      .subscribe(res => {

        console.log("Admin Users:", res);

        this.usersList = res.filter(
          email => email !== this.currentUserEmail
        );

      });
  }

  // ================= TAB SWITCH =================

  setTab(tab: string) {
    this.activeTab = tab;

    if (tab === 'C') {
      setTimeout(() => this.loadChart(), 200);
    }
  }

  // ================= TAB A =================

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
      .put(`http://localhost:5000/api/admin/approve-user/${user._id}`, {})
      .subscribe(() => {
        this.loadPendingUsers();
        this.loadAnalytics();
      });
  }

  rejectUser(user: any) {
    this.http
      .delete(`http://localhost:5000/api/admin/delete-user/${user._id}`)
      .subscribe(() => {
        this.loadPendingUsers();
        this.loadAnalytics();
      });
  }

  // ================= TAB B =================

  loadAllUsers() {
    this.http
      .get<any[]>('http://localhost:5000/api/chat/messages')
      .subscribe({
        next: () => {},
        error: () => {}
      });
  }

  sendNotice() {

    console.log("🔥 SEND CLICKED");

    if (!this.noticeMessage.trim()) return;

    let receiver = this.selectedReceiver;

    // 🔥 FIXED LOGIC
    if (receiver === 'All Users') receiver = 'all users';
    else if (receiver === 'Admins') receiver = 'admins';
    else if (receiver === 'Users') receiver = 'users';
    // else → direct email (NO CHANGE)

    const notice = {
      senderEmail: this.currentUserEmail || 'admin@gmail.com',
      receiverEmail: receiver,
      content: this.noticeMessage
    };

    console.log("Sending:", notice);

    this.http.post('http://localhost:5000/api/chat/send', notice)
      .subscribe({
        next: () => {
          console.log("✅ API CALLED SUCCESS");
          this.noticeMessage = '';
          this.loadNoticeHistory();
        },
        error: (err: any) => {
          console.error("❌ API ERROR:", err);
        }
      });
  }

  loadNoticeHistory() {
    this.http
      .get<any[]>('http://localhost:5000/api/chat/messages')
      .subscribe(res => {
        this.noticeHistory = res;
      });
  }

  // ================= TAB C =================

  loadAnalytics() {
    this.http
      .get<any>('http://localhost:5000/api/dashboard/total-users')
      .subscribe(res => {
        this.totalAdmins = res.totalAdmins;
        this.totalUsers = res.totalUsers;
        this.pendingCount = res.pendingUsers;
      });
  }

  loadChart() {

    const canvas = document.getElementById('adminChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Admins', 'Users', 'Pending'],
        datasets: [
          {
            data: [this.totalAdmins, this.totalUsers, this.pendingCount]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // ================= LOGOUT =================

  logout() {
    localStorage.clear();
    location.href = '/login';
  }
}