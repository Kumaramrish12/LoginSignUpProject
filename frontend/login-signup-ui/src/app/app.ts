import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {

  constructor(private router: Router) {}

  logout() {

    // clear login session flags
    localStorage.removeItem('activeSession');
    sessionStorage.removeItem('activeTab');

    // clear stored user info
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    // redirect to login page
    this.router.navigate(['/login']);

  }

}