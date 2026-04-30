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

  setTab(tab: string) {

    this.activeTab = tab;

    if (tab === 'F') {

      this.startSessionTimeout();

      setTimeout(() => this.loadChart(), 200);

    }

  }

  startSessionTimeout() {

    clearTimeout(this.timeoutHandle);

    this.timeoutHandle = setTimeout(() => {

      alert('Session expired (User Tab F)');

      this.logout();

    }, 20000);

  }

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

  loadChart() {

    const canvas =
      document.getElementById('userChart') as HTMLCanvasElement | null;

    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    this.chart = new Chart(ctx, {

      type: 'pie',

      data: {

        labels: ['Sent Messages', 'Received Messages'],

        datasets: [
          {
            data: [this.messages.length, 3]
          }
        ]

      }

    });

  }

  logout() {

    localStorage.removeItem('activeSession');

    sessionStorage.removeItem('activeTab');

    localStorage.clear();

    this.router.navigate(['/login']);

  }

}