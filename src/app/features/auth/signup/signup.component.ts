import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SignupResponse } from '../../../shared/data_packets/Responses/SignupResponse'

@Component({
  standalone: true,
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule],
  styleUrls: ['./signup.component.css'],
  providers: [SignupResponse],
})

export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  signupError: string = '';
  signUpClicked: boolean = false;
  isPasswordMatching: boolean = true;

  constructor(
    private router: Router,
    private http: HttpClient,
    private form_data: SignupResponse) { }

  onSignupSubmit() {
    this.signUpClicked = true;
    if (this.password !== this.confirmPassword) {
      this.isPasswordMatching = false;
      this.signupError = 'Passwords do not match!';
      return;
    }

    if (this.username && this.email && this.password) {

      this.form_data.setEmail(this.email);
      this.form_data.setUsername(this.username);
      this.form_data.setPassword(this.password);

      this.http.post('http://localhost:8080/api/auth/signup', this.form_data, { withCredentials: true }).subscribe(
        (response) => {
          alert('User created successfully! Please login to continue.');
          this.router.navigate(['/auth/login']);
        },
        (error) => {
          console.error('Login error:', error);
          alert('Username or Email already exists! Please try again.');
        });
    }
  }
}
