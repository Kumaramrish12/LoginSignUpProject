import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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

  selectedUser = 'All Users';

  users: string[] = ['All Users', 'Admin', 'User'];

  notices: any[] = [];

  chart: any;

  timeoutHandle: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {

    this.loadPendingUsers();

    // auto-refresh pending users every 5 seconds
    setInterval(() => this.loadPendingUsers(), 5000);

  }

  setTab(tab: string) {

    this.activeTab = tab;

    if (tab === 'A') {

      this.startSessionTimeout();

    }

    if (tab === 'C') {

      setTimeout(() => this.loadChart(), 200);

    }

  }

  // SESSION TIMEOUT FOR TAB A

  startSessionTimeout() {

    clearTimeout(this.timeoutHandle);

    this.timeoutHandle = setTimeout(() => {

      alert('Session expired (Admin Tab A)');

      this.logout();

    }, 20000);

  }

  // LOAD PENDING USERS FROM BACKEND

  loadPendingUsers() {

    this.http
      .get<any[]>('http://localhost:5000/api/admin/pending-users')
      .subscribe({

        next: (data) => {

          this.pendingUsers = data;

        },

        error: () => {

          console.error('Failed to load pending users');

        }

      });

  }

  // APPROVE USER

  approveUser(user: any) {

    this.http
      .put(
        `http://localhost:5000/api/admin/approve-user/${user._id}?rev=${user._rev}`,
        {}
      )
      .subscribe({

        next: () => {

          alert('User Approved');

          this.loadPendingUsers();

        },

        error: () => {

          alert('Approval failed');

        }

      });

  }

  // ✅ FIX ADDED HERE — REJECT USER FUNCTION

  rejectUser(user: any) {

    alert('Reject feature can be implemented if required by backend');

  }

  // SEND NOTICE

  sendNotice() {

    if (!this.noticeMessage.trim()) {

      alert('Message cannot be empty');

      return;

    }

    const notice = {

      senderEmail: localStorage.getItem('email'),

      receiverGroup: this.selectedUser,

      content: this.noticeMessage,

      timestamp: new Date()

    };

    this.notices.push(notice);

    this.noticeMessage = '';

  }

  // ANALYTICS GRAPH

  loadChart() {

    const canvas =
      document.getElementById('adminChart') as HTMLCanvasElement | null;

    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    this.chart = new Chart(ctx, {

      type: 'pie',

      data: {

        labels: [
          'Approved Users',
          'Pending Users',
          'Messages Sent'
        ],

        datasets: [
          {
            data: [
              12,
              this.pendingUsers.length,
              this.notices.length
            ]
          }
        ]

      }

    });

  }

  // LOGOUT

  logout() {

    localStorage.removeItem('activeSession');

    sessionStorage.removeItem('activeTab');

    localStorage.clear();

    this.router.navigate(['/login']);

  }

}