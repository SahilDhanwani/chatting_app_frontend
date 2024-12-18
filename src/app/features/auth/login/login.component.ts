// src/app/features/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) { }

  onLoginSubmit() {
    // You can add your login logic here (e.g., calling an API to validate credentials)
    if (this.username === 'sahildhanwani291203@gmail.com' && this.password === '1234') {
      // Navigate to home page after successful login
      this.router.navigate(['']);
    } else {
      // Handle incorrect credentials (can show a message or error)
      alert('Invalid credentials. Please try again.');
    }
  }
}
