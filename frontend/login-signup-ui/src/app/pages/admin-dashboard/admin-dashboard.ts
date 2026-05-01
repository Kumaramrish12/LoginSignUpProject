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
  allUsers: any[] = [];

  noticeText = '';
  selectedReceiver = 'All Users';

  noticeHistory: any[] = [];

  totalAdmins = 0;
  totalUsers = 0;

  chart: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPendingUsers();
    this.loadAnalytics();
    this.loadAllUsers();
  }

  setTab(tab: string) {
    this.activeTab = tab;

    if (tab === 'C') {
      setTimeout(() => this.renderChart(), 300);
    }
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  // ================= TAB A =================

  loadPendingUsers() {

    this.http.get<any>('http://localhost:5000/api/auth/all-users')
      .subscribe(res => {

        let users = [];

        if (res.rows) {
          users = res.rows.map((x: any) => x.doc);
        } else {
          users = res;
        }

        this.pendingUsers = users.filter(
          (u: any) =>
            u.isApproved === false ||
            u.IsApproved === false
        );

      });

  }

  approveUser(user: any) {

    const updatedUser = {
      ...user,
      isApproved: true
    };

    this.http.put(
      `http://localhost:5000/api/admin/update-user/${user._id}`,
      updatedUser
    ).subscribe(() => {

      this.loadPendingUsers();
      this.loadAnalytics();

    });

  }

  rejectUser(user: any) {

    this.http.delete(
      `http://localhost:5000/api/admin/delete-user/${user._id}`
    ).subscribe(() => {

      this.loadPendingUsers();
      this.loadAnalytics();

    });

  }

  // ================= TAB B =================

  loadAllUsers() {

    this.http.get<any>('http://localhost:5000/api/auth/all-users')
      .subscribe(res => {

        this.allUsers = res.rows
          ? res.rows.map((x: any) => x.doc)
          : res;

      });

  }

  sendNotice() {

    if (!this.noticeText) return;

    const notice = {
      sender: localStorage.getItem('email'),
      receiver: this.selectedReceiver,
      message: this.noticeText,
      timestamp: new Date()
    };

    this.noticeHistory.push(notice);

    this.noticeText = '';

  }

  // ================= TAB C =================

  loadAnalytics() {

    this.http.get<any>('http://localhost:5000/api/dashboard/total-users')
      .subscribe(data => {

        this.totalAdmins = data.totalAdmins;
        this.totalUsers = data.totalUsers;

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
        datasets: [
          {
            label: 'User Statistics',
            data: [this.totalAdmins, this.totalUsers]
          }
        ]
      }

    });

  }

}