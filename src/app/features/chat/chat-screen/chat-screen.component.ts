import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./chat-screen.component.css'],
})
export class ChatScreenComponent implements OnInit {
  selectedUser: any;
  messageInput: string = '';
  messages: any[] = [
    { content: 'Hello!', sentBy: 'other' },
    { content: 'Hi, how are you?', sentBy: 'me' },
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const state = window.history.state;
    this.selectedUser = state.user;
  }

  sendMessage() {
    if (this.messageInput.trim()) {
      this.messages.push({
        content: this.messageInput,
        sentBy: 'me',
      });
      this.messageInput = '';
    }
  }

  goBack() {
    window.history.back();
  }
}
