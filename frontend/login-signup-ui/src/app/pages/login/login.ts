import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  Email = '';
  Password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {

    const body = {
      email: this.Email,
      Password: this.Password
    };

    this.authService.login(body).subscribe({

      next: (res: any) => {

        // ================= JWT TOKEN =================

        sessionStorage.setItem(
          'token',
          res.token
        );

        // ================= USER DATA =================

        sessionStorage.setItem(
          'email',
          res.email
        );

        sessionStorage.setItem(
          'role',
          res.role
        );

        // ================= SESSION SECURITY =================

        // unique backend session
        const sessionId = res.sessionId;

        // store latest session for THIS USER only
        localStorage.setItem(
          'session_' + res.email,
          sessionId
        );

        // store current tab session
        sessionStorage.setItem(
          'currentSession',
          sessionId
        );

        // ================= COPY-PROTECTION =================

        // browser fingerprint
        const browserFingerprint =
          navigator.userAgent +
          screen.width +
          screen.height;

        sessionStorage.setItem(
          'fingerprint',
          browserFingerprint
        );

        // ================= NAVIGATION =================

        if (res.role === 'Admin') {

          this.router.navigate([
            '/admin-dashboard'
          ]);

        }
        else {

          this.router.navigate([
            '/dashboard'
          ]);

        }
      },

      error: err => {

        alert(
          'Invalid credentials or approval pending'
        );

      }

    });

  }
}