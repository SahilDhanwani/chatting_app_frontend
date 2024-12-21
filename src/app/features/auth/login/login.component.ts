import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true, // Makes the component standalone
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule], // Import RouterModule here
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginClicked: boolean = false;
  loginError: string = ''; // Variable to store error messages

  constructor(private router: Router, private http: HttpClient) { }

  onLoginSubmit() {
    this.loginClicked = true;

    if (this.username && this.password) {

      const user = {
        username: this.username,
        email: this.username,
        password: this.password,
      }

      this.http.post('https://c24a-110-227-19-99.ngrok-free.app/api/auth/login', user).subscribe(
        (response) => {
          if (response) {
            this.router.navigate(['/']);
          }
          else {
            alert('Invalid username or password! Please try again.');
          }
        },
        (error) => {
          console.log(error);
          this.loginError = error.error.message;

        }
      )
    }
  }
}
