import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-chat-list',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})

export class ChatListComponent {

  allUsernames: string[] = [];
  curr_username: String = '';
  ActiveChats: any[] = [];  // Active chats
  isModalOpen = false;  // Controls whether the modal is open or closed
  searchText = '';  // Search text for filtering users

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {

    await this.http.get('http://localhost:8080/api/getUsername', { withCredentials: true }).subscribe(
      (response: any) => {
        this.curr_username = response.username;
      },
      (error) => {
        if (error.status === 403) {
          alert('Session Expired, Please login Again');
          this.router.navigate(['/auth/login']);
        }
        console.log(error);
      }
    )

    await this.http.get('http://localhost:8080/api/activeChats', { withCredentials: true }).subscribe(
      (response: any) => {
        console.log(response);
        this.ActiveChats = response;
        this.cdr.detectChanges();
      },
      (error) => {
        if (error.status === 403) {
          alert('Session Expired, Please login Again');
          this.router.navigate(['/auth/login']);
        }
        console.log(error);
      }
    )
  }

  openNewChat() {
    this.isModalOpen = true;
    this.http.get('http://localhost:8080/api/allUsernames', { withCredentials: true }).subscribe(
      (response: any) => {
        this.allUsernames = response;
      },
      (error) => {
        if (error.status === 403) {
          alert('Session Expired, Please login Again');
          this.router.navigate(['/auth/login']);
        }
        // console.log(error);
      }
    )
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // Filter users based on the search text
  filteredUsers() {
    return this.allUsernames.filter(username =>
      username.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Open the chat with a selected user
  openChat(select_username: string) {
    this.router.navigate(['/chat', select_username], { state: { curr_username: this.curr_username, other_username: select_username } });
  }
}