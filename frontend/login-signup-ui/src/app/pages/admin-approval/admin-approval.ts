import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
  }

  loadPendingUsers() {

    this.http.get<any[]>(
      'http://localhost:5000/api/admin/pending-users'
    ).subscribe({

      next: (data) => {
        this.pendingUsers = data;
      },

      error: (err) => {
        console.error(err);
      }

    });

  }

  approveUser(user: any) {

    this.http.post(
      'http://localhost:5000/api/admin/approve-user',
      {
        _id: user._id,
        _rev: user._rev
      }
    ).subscribe({

      next: () => {
        alert('User approved successfully');
        this.loadPendingUsers();
      },

      error: () => {
        alert('Approval failed');
      }

    });

  }
}