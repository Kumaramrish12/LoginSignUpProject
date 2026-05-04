import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';   // ✅ ADDED (for chart)

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']   // ✅ make sure comma is present
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

  chart: any;   // ✅ ADDED (for chart instance)

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

    // ✅ ONLY UI ADDITION (no logic change)
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

  loadAllUsers() {

    this.http
      .get<any[]>('http://localhost:5000/api/chat/messages')
      .subscribe({
        next: () => {},
        error: () => {}
      });

  }

sendNotice() {

  if (!this.noticeMessage.trim()) return;

  const notice = {
    id: 0,
    senderEmail: 'admin@gmail.com',
    receiverEmail:
      this.selectedReceiver === 'All Users'
        ? 'all users'
        : this.selectedReceiver.toLowerCase(),
    content: this.noticeMessage,
    timestamp: new Date().toISOString()
  };

  this.http
    .post('http://localhost:5000/api/chat/send', notice)
    .subscribe({
      next: () => {
        this.noticeMessage = '';
        this.loadNoticeHistory();
      },
      error: err => console.error(err)
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

  // ✅ NEW: SMALL DOUGHNUT CHART (UI ONLY)

  loadChart() {

    const canvas = document.getElementById('adminChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // destroy old chart if exists
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