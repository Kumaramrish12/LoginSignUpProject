import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  activeTab = 'A';

  pendingUsers: any[] = [];
  allUsers: string[] = [];

  noticeText = '';
  selectedReceiver = 'All Users';
  noticeHistory: any[] = [];

  chart: any;
  totalAdmins = 0;
  totalUsers = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPendingUsers();
    this.loadUsers();
    this.loadNotices();
    this.loadAnalytics();
  }

  setTab(tab: string) {
    this.activeTab = tab;

    if (tab === 'C') {
      setTimeout(() => this.renderChart(), 200);
    }
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  // TAB A

  loadPendingUsers() {
    this.http.get<any[]>('http://localhost:5000/api/admin/pending-users')
      .subscribe(res => this.pendingUsers = res);
  }

  approveUser(user: any) {
    this.http.put(
      `http://localhost:5000/api/admin/approve-user/${user._id}?rev=${user._rev}`,
      {}
    ).subscribe(() => this.loadPendingUsers());
  }

  rejectUser(user: any) {
    this.http.delete(
      `http://localhost:5000/api/admin/reject-user/${user._id}?rev=${user._rev}`
    ).subscribe(() => this.loadPendingUsers());
  }

  // TAB B

  loadUsers() {
    this.http.get<string[]>('http://localhost:5000/api/admin/user-emails')
      .subscribe(res => this.allUsers = res);
  }

  sendNotice() {

    if (!this.noticeText) return;

    const payload = {
      sender: localStorage.getItem('email'),
      receiver: this.selectedReceiver,
      message: this.noticeText,
      timestamp: new Date()
    };

    this.http.post('http://localhost:5000/api/notice/send', payload)
      .subscribe(() => {

        this.noticeText = '';
        this.loadNotices();

      });

  }

  loadNotices() {
    this.http.get<any[]>('http://localhost:5000/api/notice/history')
      .subscribe(res => this.noticeHistory = res);
  }

  // TAB C

  loadAnalytics() {
    this.http.get<any[]>('http://localhost:5000/api/admin/user-stats')
      .subscribe(res => {

        this.totalAdmins =
          res.filter(x => x.Role === 'Admin').length;

        this.totalUsers =
          res.filter(x => x.Role === 'User').length;

        this.renderChart();

      });
  }

  renderChart() {

    const canvas =
      document.getElementById('analyticsChart') as HTMLCanvasElement;

    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {

      type: 'bar',

      data: {
        labels: ['Admins', 'Users'],
        datasets: [{
          label: 'User Statistics',
          data: [this.totalAdmins, this.totalUsers]
        }]
      }

    });

  }

}