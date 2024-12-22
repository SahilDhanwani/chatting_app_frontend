import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface User {
  username: string;
  lastMessage: string;
}
@Component({
  selector: 'app-chat-list',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})

export class ChatListComponent {

  allUsernames: string[] = [];
  curr_userId: number = 0;
  recentUsers: User[] = [];  // Active chats
  isModalOpen = false;  // Controls whether the modal is open or closed
  searchText = '';  // Search text for filtering users

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {

    this.curr_userId = window.history.state.id;

    this.http.get('https://api.example.com/users').subscribe(
      (response: any) => {
        this.recentUsers = response;
      },
      (error) => {
        console.log(error);
      }
    )
  }

  // Open the "New Chat" modal
  openNewChat() {
    this.isModalOpen = true;
  }

  // Close the modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Filter users based on the search text
  filteredUsers() {

    this.http.get('http://localhost:8080/api/allUsernames').subscribe(
      (response: any) => {
        this.allUsernames = response;
      },
      (error) => {
        console.log(error);
      }
    )

    return this.allUsernames.filter(username =>
      username.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Add selected user to the active chat list
  selectUser(username: string) {
    if (!this.recentUsers.find(user => user.username === username)) {
      const user = { username: username, lastMessage: '' };
      this.router.navigate(['/chat', username], { state: { user: user } });
      this.recentUsers.push(user);
    }
  }

  // Open the chat with a selected user
  openChat(user: any) {
    this.router.navigate(['/chat', user.username], { state: { user: user } });
  }
}
