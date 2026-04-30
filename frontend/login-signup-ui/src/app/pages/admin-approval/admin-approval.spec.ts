import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-approval.html',
  styleUrls: ['./admin-approval.css']
})
export class AdminApprovalComponent implements OnInit {

  pendingUsers: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    this.loadPendingUsers();

    // auto-refresh every 5 seconds
    setInterval(() => {

      this.loadPendingUsers();

    }, 5000);

  }

  // Load pending users from CouchDB

  loadPendingUsers() {

    this.http.get<any[]>(
      'http://localhost:5000/api/admin/pending-users'
    ).subscribe({

      next: (res) => {

        this.pendingUsers = res;

      },

      error: () => {

        console.log('Failed to load pending users');

      }

    });

  }

  // Approve user

  approveUser(user: any) {

    this.http.post(
      'http://localhost:5000/api/admin/approve',
      user
    ).subscribe({

      next: () => {

        alert('User approved ✅');

        this.loadPendingUsers();

      },

      error: () => {

        alert('Approval failed ❌');

      }

    });

  }

  // Reject user

  rejectUser(user: any) {

    this.http.post(
      'http://localhost:5000/api/admin/reject',
      user
    ).subscribe({

      next: () => {

        alert('User rejected ❌');

        this.loadPendingUsers();

      },

      error: () => {

        alert('Reject failed');

      }

    });

  }

}