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

    // ================= FINGERPRINT =================

    const browserFingerprint =
      navigator.userAgent +
      screen.width +
      screen.height +
      navigator.language;

    // ================= LOGIN BODY =================

    const body = {

      email: this.Email,

      Password: this.Password,

      // ✅ SEND TO BACKEND
      fingerprint: browserFingerprint
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

        const sessionId =
          res.sessionId;

        // latest active session for THIS USER
        localStorage.setItem(
          'session_' + res.email,
          sessionId
        );

        // current tab session
        sessionStorage.setItem(
          'currentSession',
          sessionId
        );

        // ================= STORE FINGERPRINT =================

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