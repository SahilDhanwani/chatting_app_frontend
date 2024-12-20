import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true, // Makes the component standalone
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule, CommonModule, RouterModule], // Import RouterModule here
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginClicked: boolean = false;
  loginError: string = ''; // Variable to store error messages

  constructor(private router: Router) { }

  onLoginSubmit() {
    this.loginClicked = true;

    // Basic login logic (you can replace this with an actual API call)
    if (this.username === 'sahildhanwani291203@gmail.com' && this.password === '1234') {
      // Navigate to the home page (or any protected route after successful login)
      this.router.navigate(['/']); // Navigate to the home page
    } else {
      // Display an error message if credentials are incorrect
      this.loginError = 'Invalid credentials. Please try again.';
    }
  }
}
