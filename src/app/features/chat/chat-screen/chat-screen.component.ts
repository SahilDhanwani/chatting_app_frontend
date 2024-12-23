import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  imports: [FormsModule, CommonModule, HttpClientModule],
  styleUrls: ['./chat-screen.component.css'],
})
export class ChatScreenComponent implements OnInit {
  curr_username: any;
  messageInput: string = '';
  other_username: any;
  messages: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    const state = window.history.state;
    this.curr_username = state.curr_username;
    this.other_username = state.other_username;

    console.log('Current User: ', this.curr_username);
    console.log('Other User: ', this.other_username);



    console.log('http://localhost:8080/api/getId?username=${username} ' + this.getId(this.curr_username));

    this.http.get(`http://localhost:8080/api/getMessages?user1=${this.getId(this.curr_username)}?user2=${this.getId(this.other_username)}`).subscribe(
      (response: any) => {
        this.messages = response;
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  getId(username: any): number {
    this.http.get(`http://localhost:8080/api/getId?username=${username}`).subscribe(
      (response: any) => {
        // console.log(response);
        return response;
      },
    );
    return 0;
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
