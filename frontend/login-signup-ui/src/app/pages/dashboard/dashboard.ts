import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import * as signalR from '@microsoft/signalr';

// 🔥 ADDED ONLY THESE 2 IMPORTS
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

  messages: any[] = [];
  currentUserEmail = '';

  chart: any;
  timeoutHandle: any;

  hubConnection: signalR.HubConnection | null = null;
  refreshInterval: any;

  constructor(private router: Router, private http: HttpClient) {}

  // ================= INIT =================

  ngOnInit() {

    this.currentUserEmail = localStorage.getItem('email') || '';

    this.checkSession();

    this.loadMessages();

    this.startSignalR();

    this.refreshInterval = setInterval(() => {
      this.checkSession();
      this.loadMessages();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
    clearInterval(this.refreshInterval);
  }

  // ================= SESSION CONTROL =================

  checkSession() {

    const activeSession = localStorage.getItem('activeSession');
    const currentSession = sessionStorage.getItem('currentSession');

    if (activeSession !== currentSession) {

      alert('Logged out: another session detected');

      this.logout();
    }
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
      console.log('📩 Real-time update');
      this.loadMessages();
    });

    this.hubConnection.onclose(() => {
      console.log('❌ SignalR Disconnected');
    });

    this.hubConnection.onreconnected(() => {
      console.log('✅ SignalR Reconnected');
    });
  }

  // ================= LOAD MESSAGES =================

loadMessages() {
  this.http.get<any[]>('http://localhost:5000/api/chat/messages')
    .subscribe(res => {

      this.messages = res.filter(m =>
        m.receiverEmail === this.currentUserEmail ||
        m.senderEmail === this.currentUserEmail
      );

    });
}



  // ================= SEND MESSAGE =================

 sendNotice() {

  if (!this.noticeMessage.trim()) return;

  let receiver = this.selectedGroup.toLowerCase();

  // 🔥 FIX
  if (receiver === 'user') receiver = 'users';
  if (receiver === 'admin') receiver = 'admins';

  const msg = {
    senderEmail: this.currentUserEmail,
    receiverEmail: receiver,
    content: this.noticeMessage,
    timestamp: new Date()
  };

  this.http.post('http://localhost:5000/api/chat/send', msg)
    .subscribe(() => {
      this.noticeMessage = '';
      this.loadMessages(); // 🔥 IMPORTANT
    });
}



  // ================= TAB SWITCH =================

  setTab(tab: string) {
    this.activeTab = tab;

    if (tab === 'F') {
      this.startSessionTimeout();
      setTimeout(() => this.loadChart(), 300);
    } else {
      clearTimeout(this.timeoutHandle);
    }
  }

  // ================= ANALYTICS =================

  loadChart() {

    const sent = this.messages.filter(
      m => m.senderEmail === this.currentUserEmail
    ).length;

    const received = this.messages.filter(
      m =>
        m.receiverEmail === this.currentUserEmail ||
        m.receiverEmail === 'users' ||
        m.receiverEmail === 'all users'
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
      },
      options: {
        responsive: true,
        cutout: '65%'
      }
    });
  }

  // ================= SESSION TIMEOUT =================

  startSessionTimeout() {

    clearTimeout(this.timeoutHandle);

    this.timeoutHandle = setTimeout(() => {

      if (this.activeTab === 'F') {

        alert('Session expired (User Tab F)');
        this.logout();
      }

    }, 20000);
  }

  // ================= PRINT FUNCTION (NEW) =================

 printNotices() {

  const content = document.getElementById('noticeBoard');
  if (!content) return;

  const printWindow = window.open('', '', 'width=900,height=700');

  printWindow?.document.write(`
    <html>
    <head>
      <title>Notice Board</title>

      <style>
        body {
          font-family: Arial;
          padding: 20px;
          background: #fff;
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }

        /* CHAT CONTAINER BORDER */
        .chat-container {
          border: 2px solid #000;
          padding: 15px;
          border-radius: 10px;
        }

        /* MESSAGE BOX */
        .message-card {
          padding: 10px;
          margin: 10px;
          border-radius: 10px;
          width: 60%;
          clear: both;
          border: 1px solid #000; /* 🔥 BORDER ADDED */
        }

        /* RECEIVED (LEFT) */
        .received {
          background: #f3e6b3;
          float: left;
          text-align: left;
        }

        /* SENT (RIGHT) */
        .sent {
          background: #cfe2ff;
          float: right;
          text-align: right;
        }

        small {
          font-size: 10px;
          color: gray;
        }

        /* CLEAR FLOAT FIX */
        .clearfix::after {
          content: "";
          display: block;
          clear: both;
        }

      </style>

    </head>

    <body>

      <h2>Notice Board</h2>

      <div class="chat-container clearfix">
        ${content.innerHTML}
      </div>

    </body>
    </html>
  `);

  printWindow?.document.close();
  printWindow?.print();
}
  // ================= PDF FUNCTION (NEW) =================

downloadPDF() {

  const data = document.getElementById('noticeBoard');
  if (!data) return;

  // 🔥 FIX SCROLL ISSUE
  data.style.maxHeight = 'none';
  data.style.overflow = 'visible';

  html2canvas(data, {
    scale: 2,
    useCORS: true,
    scrollY: -window.scrollY
  }).then(canvas => {

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('NoticeBoard.pdf');
  });
}

  // ================= LOGOUT =================

  logout() {

    sessionStorage.clear();

    this.router.navigate(['/login']);
  }
}