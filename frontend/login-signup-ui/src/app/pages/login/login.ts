import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
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

        // ✅ STORE USER PER TAB (IMPORTANT FIX)
        sessionStorage.setItem('email', res.email);
        sessionStorage.setItem('role', res.role);

        // ✅ SESSION CONTROL (PER USER)
        const sessionId = Date.now().toString();

        // store session per user (NOT global)
        localStorage.setItem('session_' + res.email, sessionId);

        // store session for this tab
        sessionStorage.setItem('currentSession', sessionId);

        // ✅ NAVIGATION
        if (res.role === 'Admin')
          this.router.navigate(['/admin-dashboard']);
        else
          this.router.navigate(['/dashboard']);
      },

      error: err => {
        alert('Invalid credentials or approval pending');
      }

    });
  }
}