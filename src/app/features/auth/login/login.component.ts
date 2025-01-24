import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoginRequest } from '../../../shared/data_packets/Requests/LginRequest'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule],
  styleUrls: ['./login.component.css'],
  providers: [LoginRequest]
})

export class LoginComponent {
  username: string = '';
  password: string = '';
  loginClicked: boolean = false;
  loginError: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
  ) { }

  onLoginSubmit() {
    this.loginClicked = true;

    if (this.username && this.password) {

      const form_data = new LoginRequest();

      form_data.setUsername(this.username);
      form_data.setPassword(this.password);

      this.http.post('http://localhost:8080/api/auth/login', form_data, { withCredentials: true }).subscribe(
        (response) => {
          this.router.navigate(['/chatlist']);
        },
        (error) => {
          console.error('Login error:', error);
          alert('Invalid username or password! Please try again.');
        }
      );
    }
  }
}
