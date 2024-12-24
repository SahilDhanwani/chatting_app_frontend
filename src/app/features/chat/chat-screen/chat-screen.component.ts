import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  imports: [FormsModule, CommonModule, HttpClientModule],
  styleUrls: ['./chat-screen.component.css'],
})
export class ChatScreenComponent implements OnInit {
  curr_username: any;
  messageInput: string = '';
  curr_user_id: any;
  other_user_id: any;
  other_username: any;
  messages: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  async ngOnInit() {
    const state = window.history.state;
    this.curr_username = state.curr_username;
    this.other_username = state.other_username;

    this.curr_user_id = await this.getId(this.curr_username);
    this.other_user_id = await this.getId(this.other_username);

    this.http.get(
      `http://localhost:8080/api/getMessages?user1=${this.curr_user_id}&user2=${this.other_user_id}`
    ).subscribe(
      (response: any) => {
        console.log('Messages:', response);
        this.messages = response;
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }

  async getId(username: any): Promise<number> {
    const response = await lastValueFrom(
      this.http.get<number>(`http://localhost:8080/api/getId?username=${username}`)
    );
    console.log('The response is as : ', response);
    return response;
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
