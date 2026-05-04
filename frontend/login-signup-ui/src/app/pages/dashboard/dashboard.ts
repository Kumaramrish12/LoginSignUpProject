import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  activeTab = 'D';

  noticeMessage = '';
  selectedGroup = 'All Users';
  groups = ['Admin', 'User', 'All Users'];

  messages: any[] = [];
  currentUserEmail = '';

  chart: any;
  timeoutHandle: any;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {

    this.currentUserEmail =
      localStorage.getItem('email') || '';

    this.loadMessages(); // 🔥 IMPORTANT

  }

  setTab(tab: string) {

    this.activeTab = tab;

    if (tab === 'F') {
      this.startSessionTimeout();
      setTimeout(() => this.loadChart(), 300);
    } else {
      clearTimeout(this.timeoutHandle); // 🔥 STOP LOGOUT
    }
  }

  // 🔥 FETCH FROM BACKEND
  loadMessages() {

    this.http
      .get<any[]>('http://localhost:5000/api/chat/messages')
      .subscribe(res => {

        this.messages = res.filter(msg =>
          msg.receiverEmail === this.currentUserEmail ||
          msg.senderEmail === this.currentUserEmail
        );

      });

  }

  // 🔥 SEND MESSAGE
  sendNotice() {

    if (!this.noticeMessage.trim()) return;

    const message = {
      senderEmail: this.currentUserEmail,
      receiverEmail: this.selectedGroup.toLowerCase(), // IMPORTANT
      content: this.noticeMessage
    };

    this.http
      .post('http://localhost:5000/api/chat/send', message)
      .subscribe(() => {

        this.noticeMessage = '';
        this.loadMessages(); // 🔥 refresh

      });

  }

  // 🔥 COUNTS FIX
  getSentCount() {
    return this.messages.filter(
      m => m.senderEmail === this.currentUserEmail
    ).length;
  }

  getReceivedCount() {
    return this.messages.filter(
      m => m.senderEmail !== this.currentUserEmail
    ).length;
  }

  // 🔥 CHART FIX
  loadChart() {

    const canvas =
      document.getElementById('userChart') as HTMLCanvasElement;

    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    const ctx = canvas.getContext('2d');

    this.chart = new Chart(ctx!, {
      type: 'doughnut',
      data: {
        labels: ['Sent', 'Received'],
        datasets: [
          {
            data: [
              this.getSentCount(),
              this.getReceivedCount()
            ],
            backgroundColor: ['#3b82f6', '#f59e0b']
          }
        ]
      },
      options: {
        responsive: true,
        cutout: '60%' // smaller donut
      }
    });
  }

  // 🔥 LOGOUT ONLY TAB F
  startSessionTimeout() {

    clearTimeout(this.timeoutHandle);

    this.timeoutHandle = setTimeout(() => {

      if (this.activeTab === 'F') {
        alert('Session expired (User Tab F)');
        this.logout();
      }

    }, 20000);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}