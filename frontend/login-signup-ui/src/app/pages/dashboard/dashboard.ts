import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import * as signalR from '@microsoft/signalr';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  activeTab = 'D';

  noticeMessage = '';
  selectedGroup = 'All Users';

  groups = ['Admin', 'User', 'All Users'];
  usersList: string[] = [];

  messages: any[] = [];
  currentUserEmail = '';

  chart: any;
  timeoutHandle: any;

  hubConnection: signalR.HubConnection | null = null;
  refreshInterval: any;

  constructor(private router: Router, private http: HttpClient) {}

  // ================= INIT =================

  ngOnInit() {

    // ✅ FIX: use sessionStorage (NOT localStorage)
    this.currentUserEmail = sessionStorage.getItem('email') || '';

    if (!this.currentUserEmail) {
      alert('Session expired. Please login again.');
      this.logout();
      return;
    }

    // ✅ NEW SESSION FIX
    this.checkSessionConflict();

    this.loadMessages();
    this.loadUsers();
    this.startSignalR();

    this.refreshInterval = setInterval(() => {
      this.loadMessages();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
    clearInterval(this.refreshInterval);
  }

  // ================= SESSION FIX =================

  checkSessionConflict() {

    const email = sessionStorage.getItem('email');
    const currentSession = sessionStorage.getItem('currentSession');

    window.addEventListener('storage', (event) => {

      if (event.key === 'session_' + email) {

        const latestSession = localStorage.getItem('session_' + email);

        if (currentSession !== latestSession) {
          alert('Session expired (opened in another tab)');
          this.logout();
        }
      }
    });
  }

  // ================= LOAD USERS =================

  loadUsers() {
    this.http.get<string[]>('http://localhost:5000/api/users')
      .subscribe(res => {

        this.usersList = res.filter(
          email => email !== this.currentUserEmail
        );

      });
  }

  // ================= SIGNALR =================

  startSignalR() {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/chatHub')
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ SignalR Connected'))
      .catch(err => console.error('❌ SignalR Error:', err));

    this.hubConnection.on('ReceiveMessage', () => {
      this.loadMessages();
    });
  }

  // ================= LOAD MESSAGES =================

  loadMessages() {
    this.http.get<any[]>('http://localhost:5000/api/chat/messages')
      .subscribe(res => {

        this.messages = res.filter(m =>
          m.senderEmail === this.currentUserEmail ||
          m.receiverEmail === this.currentUserEmail
        );

      });
  }

  // ================= SEND MESSAGE =================

  sendNotice() {

    if (!this.noticeMessage.trim()) return;

    let receiver = this.selectedGroup;

    if (receiver === 'User') receiver = 'users';
    else if (receiver === 'Admin') receiver = 'admins';
    else if (receiver === 'All Users') receiver = 'all users';

    const msg = {
      senderEmail: this.currentUserEmail,
      receiverEmail: receiver,
      content: this.noticeMessage,
      timestamp: new Date()
    };

    this.http.post('http://localhost:5000/api/chat/send', msg)
      .subscribe(() => {
        this.noticeMessage = '';
        this.loadMessages();
      });
  }

  // ================= TAB =================

  setTab(tab: string) {
    this.activeTab = tab;

    if (tab === 'F') {
      this.startSessionTimeout();
      setTimeout(() => this.loadChart(), 300);
    } else {
      clearTimeout(this.timeoutHandle);
    }
  }

  startSessionTimeout() {

    clearTimeout(this.timeoutHandle);

    this.timeoutHandle = setTimeout(() => {

      if (this.activeTab === 'F') {
        alert('Session expired (User Tab F)');
        this.logout();
      }

    }, 20000);
  }

  // ================= ANALYTICS =================

  loadChart() {

    const sent = this.messages.filter(
      m => m.senderEmail === this.currentUserEmail
    ).length;

    const received = this.messages.filter(
      m => m.receiverEmail === this.currentUserEmail
    ).length;

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
      }
    });
  }

  // ================= PRINT =================

  printNotices() {

    const content = document.getElementById('noticeBoard');
    if (!content) return;

    const printWindow = window.open('', '', 'width=900,height=700');

    printWindow?.document.write(`
      <html>
      <head>
        <style>
          .message-card { border:1px solid #000; margin:10px; padding:10px; }
          .received { background:#f3e6b3; float:left; width:60%; }
          .sent { background:#cfe2ff; float:right; width:60%; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);

    printWindow?.document.close();
    printWindow?.print();
  }

  // ================= PDF =================
downloadPDF() {

  console.log("🔥 PDF CLICKED");

  const data = document.getElementById('noticeBoard');
  if (!data) {
    console.error("❌ noticeBoard not found");
    return;
  }

  // ✅ FIX: since chat-container = same element
  const scrollContainer = data as HTMLElement;

  // store original styles
  const originalMaxHeight = scrollContainer.style.maxHeight;
  const originalOverflow = scrollContainer.style.overflow;

  // 🔥 REMOVE SCROLL LIMIT
  scrollContainer.style.maxHeight = 'none';
  scrollContainer.style.overflow = 'visible';

  html2canvas(data, {
    scale: 2,
    useCORS: true
  }).then(canvas => {

    console.log("✅ CANVAS CREATED");

    const imgWidth = 210;      // A4 width
    const pageHeight = 295;    // A4 height
    const imgHeight = canvas.height * imgWidth / canvas.width;

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    let heightLeft = imgHeight;
    let position = 0;

    // ✅ FIRST PAGE
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // ✅ MULTIPLE PAGES
    while (heightLeft > 0) {

      position = heightLeft - imgHeight;

      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

      heightLeft -= pageHeight;
    }

    console.log("✅ PDF READY");

    // 🔥 FORCE DOWNLOAD (NO BLOCK)
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'NoticeBoard.pdf';
    a.click();

    URL.revokeObjectURL(url);

    console.log("✅ PDF DOWNLOADED");

    // ✅ RESTORE ORIGINAL UI
    scrollContainer.style.maxHeight = originalMaxHeight;
    scrollContainer.style.overflow = originalOverflow;

  }).catch(err => {
    console.error("❌ PDF ERROR:", err);
  });
}
  // ================= LOGOUT =================

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}