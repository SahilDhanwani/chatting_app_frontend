import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { jwt } from '../../../shared/jwt/jwt'; // Correct import of jwt class

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
        password: this.password,
      }

      this.http.post('http://localhost:8080/api/auth/login', user).subscribe(
        (response: any) => { // Type response as 'any' or specific type
          if (response && response.token) {
            console.log(response);
            jwt.setToken(response.token); // Call the static method to set token
            this.router.navigate(['/chatlist']);
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

  getuserName(id: any) {
    this.http.get<{ username: string }>(`http://localhost:8080/api/getUsername?id=${id}`).subscribe(
      (response) => {
        this.username = response.username;
      },
    );
    return this.username;
  }
}
