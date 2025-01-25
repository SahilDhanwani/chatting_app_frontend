// src/app/features/home/home.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SignupRequest } from '../../shared/data_packets/Requests/SignupRequest';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoginRequest } from '../../shared/data_packets/Requests/LginRequest';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [HttpClientModule],
})

export class HomeComponent {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  onLoginClick() {
    this.router.navigate(['/auth/login']);
  }

  onSignupClick() {
    this.router.navigate(['/auth/signup']);
  }

  onGuestLoginClick() {
    const signup_data = new SignupRequest();
    const login_data = new LoginRequest();
    const timestamp = Date.now();
    const email = 'guest' + timestamp.toString().slice(-6) + '@guest.com';
    const username = 'guest' + timestamp.toString().slice(-6);

    signup_data.setEmail(email);
    signup_data.setUsername(username);
    signup_data.setPassword('1234');

    login_data.setUsername(username);
    login_data.setPassword('1234');

    this.http.post('http://localhost:8080/api/auth/signup', signup_data, { withCredentials: true }).subscribe(
      (response) => {
        this.http.post('http://localhost:8080/api/auth/login', login_data, { withCredentials: true }).subscribe(
          (response) => {
            this.router.navigate(['/chatlist']);
          },
          (error) => {
            console.error('Login error:', error);
            alert('Invalid username or password! Please try again.');
          }
        );
      },
      (error) => {
        console.error('Login error:', error);
        alert('Username or Email already exists! Please try again.');
      });
  };
}


