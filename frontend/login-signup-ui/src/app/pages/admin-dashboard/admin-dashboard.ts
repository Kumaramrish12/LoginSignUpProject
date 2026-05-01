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

    this.loadUsersFromDB();

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

  // =========================
  // LOAD USERS FROM COUCHDB
  // =========================

  loadUsersFromDB() {

    this.http.get<any>('http://localhost:5000/api/auth/all-users')

      .subscribe(res => {

        const users = res.rows.map((x: any) => x.doc);

        this.allUsers = users;

        // TAB A → pending users

        this.pendingUsers = users.filter(

          (u: any) => u.IsApproved === false

        );

        // TAB C → analytics counts

        this.totalAdmins = users.filter(

          (u: any) => u.Role === 'Admin'

        ).length;

        this.totalUsers = users.filter(

          (u: any) => u.Role === 'User'

        ).length;

      });

  }

  // =========================
  // TAB A APPROVE
  // =========================

  approveUser(user: any) {

    user.IsApproved = true;

    this.http.put(

      `http://localhost:5000/api/admin/update-user/${user._id}`,

      user

    ).subscribe(() => {

      this.loadUsersFromDB();

    });

  }

  rejectUser(user: any) {

    this.http.delete(

      `http://localhost:5000/api/admin/delete-user/${user._id}`

    ).subscribe(() => {

      this.loadUsersFromDB();

    });

  }

  // =========================
  // TAB B SEND NOTICE
  // =========================

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

  // =========================
  // TAB C CHART
  // =========================

  renderChart() {

    const canvas = document.getElementById(

      'analyticsChart'

    ) as HTMLCanvasElement;

    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {

      type: 'bar',

      data: {

        labels: ['Admins', 'Users'],

        datasets: [

          {

            label: 'User Statistics',

            data: [

              this.totalAdmins,

              this.totalUsers

            ]

          }

        ]

      }

    });

  }

}