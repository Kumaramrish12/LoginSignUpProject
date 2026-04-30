import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {

    // remove stale session if browser restarted
    if (!sessionStorage.getItem('activeTab')) {
      localStorage.removeItem('activeSession');
    }

    // auto-clean session when tab closes
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('activeSession');
    });

  }

  login() {

    // block login if already active elsewhere
    if (localStorage.getItem('activeSession')) {

      alert('User already logged in another tab ⚠️');

      return;
    }

    const loginData = {
      Email: this.email,
      Password: this.password
    };

    this.authService.login(loginData).subscribe({

      next: (res: any) => {

        if (!res || !res.role) {

          alert('Login failed');

          return;
        }

        // store session flags
        localStorage.setItem('activeSession', 'true');
        sessionStorage.setItem('activeTab', 'true');

        localStorage.setItem('email', this.email);
        localStorage.setItem('role', res.role);

        // role routing
        if (res.role === 'Admin') {

          this.router.navigate(['/admin-dashboard']);

        } else {

          this.router.navigate(['/dashboard']);

        }

      },

      error: () => {

        alert('Invalid credentials or approval pending');

      }

    });

  }

}