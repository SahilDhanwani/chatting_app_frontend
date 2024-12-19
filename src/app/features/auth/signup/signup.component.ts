import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  standalone: true,  // Makes the component standalone
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  imports: [FormsModule, CommonModule, RouterModule], // Import RouterModule
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  signupError: string = ''; // To store error messages
  isPasswordMatching: boolean = true; // To track if passwords match

  constructor(private router: Router) {}

  onSignupSubmit() {
    if (this.password !== this.confirmPassword) {
      this.isPasswordMatching = false;
      this.signupError = 'Passwords do not match!';
      return;
    }

    // You can replace this with actual registration logic (e.g., API call)
    // For now, just simulate successful registration
    if (this.username && this.email && this.password) {
      // Navigate to the login page after successful signup
      this.router.navigate(['/auth/login']);
    } else {
      // Do nothing
    }
  }
}
