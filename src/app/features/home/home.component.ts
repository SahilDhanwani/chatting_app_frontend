import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) { }

  navigateToLogin() {
    this.router.navigate(['/auth/login']); // Adjust route path based on your setup
  }

  navigateToSignup() {
    this.router.navigate(['/auth/signup']); // Adjust route path based on your setup
  }
}

