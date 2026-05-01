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

    console.log("LOGIN REQUEST:", body);

    this.authService.login(body).subscribe({

      next: (res: any) => {

        console.log("LOGIN RESPONSE:", res);

        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);

        if (res.role === 'Admin')
          this.router.navigate(['/admin-dashboard']);
        else
          this.router.navigate(['/dashboard']);
      },

      error: err => {

        console.log("LOGIN ERROR:", err);

        alert('Invalid credentials or approval pending');

      }

    });

  }

}