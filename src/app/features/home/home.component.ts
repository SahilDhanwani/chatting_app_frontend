// src/app/features/home/home.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

export class HomeComponent {
  constructor(private router: Router) { }

  onLoginClick() {
    this.router.navigate(['/auth/login']);
  }

  onSignupClick() {
    this.router.navigate(['/auth/signup']);
  }
}
