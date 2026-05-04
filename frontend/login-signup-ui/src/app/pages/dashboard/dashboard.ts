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

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.currentUserEmail = localStorage.getItem('email') || '';
    this.loadMessages();
  }

setTab(tab: string) {
  this.activeTab = tab;

  // ❌ STOP TIMER when leaving Tab F
  if (tab !== 'F') {
    clearTimeout(this.timeoutHandle);
  }

  // ✅ START only when entering Tab F
  if (tab === 'F') {
    this.startSessionTimeout();
    setTimeout(() => this.loadChart(), 300);
  }
}

  // 🔥 LOAD MESSAGES FROM BACKEND
  loadMessages() {
    this.http.get<any[]>('http://localhost:5000/api/chat/messages')
      .subscribe(res => {

        this.messages = res.filter(m =>
          m.receiverEmail === this.currentUserEmail ||
          m.senderEmail === this.currentUserEmail
        );

      });
  }

  // 🔥 SEND MESSAGE
  sendNotice() {

    if (!this.noticeMessage.trim()) return;

    const msg = {
      senderEmail: this.currentUserEmail,
      receiverEmail:
        this.selectedGroup === 'All Users'
          ? 'all users'
          : this.selectedGroup.toLowerCase(),
      content: this.noticeMessage,
      timestamp: new Date()
    };

    this.http.post('http://localhost:5000/api/chat/send', msg)
      .subscribe(() => {
        this.noticeMessage = '';
        this.loadMessages();
      });
  }

  // 🔥 SESSION TIMEOUT (ONLY TAB F)
  startSessionTimeout() {
    clearTimeout(this.timeoutHandle);

    this.timeoutHandle = setTimeout(() => {
      alert('Session expired (User Tab F)');
      this.logout();
    }, 20000);
  }

  // 🔥 ANALYTICS CHART
  loadChart() {

    const sent = this.messages.filter(m => m.senderEmail === this.currentUserEmail).length;
    const received = this.messages.filter(m => m.receiverEmail === this.currentUserEmail).length;

    const canvas = document.getElementById('userChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Sent', 'Received'],
        datasets: [{
          data: [sent, received],
          backgroundColor: ['#3b82f6', '#f59e0b']
        }]
      },
      options: {
        responsive: true,
        cutout: '60%'
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}