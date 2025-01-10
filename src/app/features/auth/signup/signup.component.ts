import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Component({
  standalone: true,
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule],
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  signupError: string = ''; // To store error messages
  signUpClicked: boolean = false;
  isPasswordMatching: boolean = true; // To track if passwords match

  constructor(private router: Router, private http: HttpClient) { }

  onSignupSubmit() {
    this.signUpClicked = true;
    if (this.password !== this.confirmPassword) {
      this.isPasswordMatching = false;
      this.signupError = 'Passwords do not match!';
      return;
    }

    if (this.username && this.email && this.password) {

      const user = {
        username: this.username,
        email: this.email,
        password: this.password,
      }

      this.http.post('http://localhost:8080/api/auth/signup', user, { withCredentials: true }).subscribe(
        (response) => {
          alert('User created successfully! Please login to continue.');
          this.router.navigate(['/auth/login']);
        }, 
        
        (error) => {
          alert('Username or Email already exists! Please try again.');
        });
    }
  }
}
