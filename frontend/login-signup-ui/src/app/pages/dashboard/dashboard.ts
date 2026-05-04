import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(private router: Router) {}

  ngOnInit() {
    this.currentUserEmail =
      localStorage.getItem('email') || '';
  }

  // ================= TAB SWITCH =================

  setTab(tab: string) {

    this.activeTab = tab;

    // ✅ STOP timer when leaving Tab F
    clearTimeout(this.timeoutHandle);

    if (tab === 'F') {

      this.startSessionTimeout();

      setTimeout(() => this.loadChart(), 200);

    }

  }

  // ================= SESSION TIMER =================

  startSessionTimeout() {

    this.timeoutHandle = setTimeout(() => {

      // ✅ ONLY logout if still in Tab F
      if (this.activeTab === 'F') {
        alert('Session expired (User Tab F)');
        this.logout();
      }

    }, 20000);

  }

  // ================= SEND MESSAGE =================

  sendNotice() {

    if (!this.noticeMessage.trim()) {
      alert('Message cannot be empty');
      return;
    }

    const messageObj = {

      senderEmail: this.currentUserEmail,
      receiverGroup: this.selectedGroup,
      content: this.noticeMessage,
      timestamp: new Date()

    };

    this.messages.push(messageObj);

    this.noticeMessage = '';

  }

  // ================= CHART =================

  loadChart() {

    const canvas =
      document.getElementById('userChart') as HTMLCanvasElement | null;

    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // ✅ CALCULATE PROPER VALUES
    const sent = this.messages.filter(
      m => m.senderEmail === this.currentUserEmail
    ).length;

    const received = this.messages.filter(
      m => m.senderEmail !== this.currentUserEmail
    ).length;

    this.chart = new Chart(ctx, {

      type: 'doughnut',   // 🔥 better UI

      data: {
        labels: ['Sent Messages', 'Received Messages'],
        datasets: [
          {
            data: [sent, received]
          }
        ]
      },

      options: {
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

    localStorage.removeItem('activeSession');
    sessionStorage.removeItem('activeTab');
    localStorage.clear();

    this.router.navigate(['/login']);

  }

}