import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SignupRequest } from '../../../shared/data_packets/Requests/SignupRequest'
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule],
  styleUrls: ['./signup.component.css'],
  providers: [SignupRequest],
})

export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  signupError: string = '';
  signUpClicked: boolean = false;
  isPasswordMatching: boolean = true;
  baseUrl: string = environment.ChatAppAPIBaseURL;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  onSignupSubmit() {
    this.signUpClicked = true;
    if (this.password !== this.confirmPassword) {
      this.isPasswordMatching = false;
      this.signupError = 'Passwords do not match!';
      return;
    }

    if (this.username && this.email && this.password) {

      const form_data = new SignupRequest();

      form_data.setEmail(this.email);
      form_data.setUsername(this.username);
      form_data.setPassword(this.password);

      this.http.post(`${this.baseUrl}/api/auth/signup`, form_data, { withCredentials: true }).subscribe(
        (response) => {
          alert('User created successfully! Please login to continue.');
          this.router.navigate(['/auth/login']);
        },
        (error) => {
          console.error('Signup error:', error);
          alert('Username or Email already exists! Please try again.');
        });
    }
  }
}
