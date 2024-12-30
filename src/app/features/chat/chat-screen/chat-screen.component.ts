import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { delay, lastValueFrom } from 'rxjs';
import { WebSocketService } from '../../../shared/web-socket.service'; // Import the WebSocketService
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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private webSocketService: WebSocketService
  ) { }

  async ngOnInit() {
    const state = window.history.state;
    this.curr_username = state.curr_username;
    this.other_username = state.other_username;

    this.curr_user_id = await this.getId(this.curr_username);
    this.other_user_id = await this.getId(this.other_username);

    this.webSocketService.setCurrentUserId(this.curr_user_id);

    // Fetch initial messages from the database
    this.http
      .get(
        `http://localhost:8080/api/getMessages?user1=${this.curr_user_id}&user2=${this.other_user_id}`
      )
      .subscribe(
        (response: any) => {
          this.messages = response;
        },
        (error) => {
          console.error('Error fetching messages:', error);
        }
      );

    // Subscribe to incoming WebSocket messages
    this.webSocketService.getMessages().subscribe((message_packet) => {

      console.log('Received message from Socket:', message_packet);

      if (message_packet != null)
        this.messages.push([
          message_packet.message,
          message_packet.sender_id
        ]);
    });
  }

  async getId(username: any): Promise<number> {
    const response = await lastValueFrom(
      this.http.get<number>(`http://localhost:8080/api/getId?username=${username}`)
    );
    return response;
  }

  sendMessage() {
    if (this.messageInput.trim()) {
      const message_packet = {
        message: this.messageInput,
        sender_id: this.curr_user_id,
        receiver_id: this.other_user_id,
        timestamp: new Date().toISOString(), // Generate current timestamp
      };

      // Send message via WebSocket
      this.webSocketService.sendMessage(JSON.stringify(message_packet)); // Send the entire message_packet

      // Optionally, add the sent message to the local messages array for immediate feedback
      this.messages.push([
        message_packet.message,
        message_packet.sender_id
      ]);

      // Clear the input
      this.messageInput = '';
    }
  }

  goBack() {
    window.history.back();
  }
}
