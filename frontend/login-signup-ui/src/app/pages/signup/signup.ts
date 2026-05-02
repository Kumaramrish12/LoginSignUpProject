import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {

  FirstName = '';
  LastName = '';
  Email = '';
  Password = '';
  ConfirmPassword = '';
  Role = 'User';

  constructor(private auth: AuthService, private router: Router) {}

  signup() {

    if (this.Password !== this.ConfirmPassword) {
      alert('Passwords do not match ❌');
      return;
    }

    const userData = {
      FirstName: this.FirstName,
      LastName: this.LastName,
      Email: this.Email,
      Password: this.Password,
      ConfirmPassword: this.ConfirmPassword,
      Role: this.Role
    };

    this.auth.register(userData).subscribe({

      next: () => {
        alert('Registration successful ✅');
        this.router.navigate(['/login']);
      },

      error: (err) => {
        console.error(err);
        alert('Registration failed ❌');
      }

    });

  }

}