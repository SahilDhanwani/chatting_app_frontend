import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-list',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})

export class ChatListComponent {
  users = [
    { username: 'John', profilePicture: 'assets/john.jpg', lastMessage: 'Hey, how are you?' },
    { username: 'Jane', profilePicture: 'assets/jane.jpg', lastMessage: 'Hello!' },
  ];

  constructor(private router: Router) { }

  openChat(user: any) {
    this.router.navigate(['/chat', user.username], { state: { user: user } });
  }
}
