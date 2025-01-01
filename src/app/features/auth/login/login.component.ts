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
        password: this.password,
      }

      this.http.post('http://localhost:8080/api/auth/login', user).subscribe(
        (response) => {
          if (response) {
            this.router.navigate(['/chatlist'], { state: { username: this.getuserName(response) } });
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
    this.http.get<{ username: string }>(`http://localhost:8080/api/getUsername?id=${id}`,).subscribe(
      (response) => {
        this.username = response.username;
      },
    );
    return this.username;
  }
}
