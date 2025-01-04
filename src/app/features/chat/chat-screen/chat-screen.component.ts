import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { WebSocketService } from '../../../shared/web-socket/web-socket.service'; // Import the WebSocketService
import { jwt } from '../../../shared/jwt/jwt';
@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  imports: [FormsModule, CommonModule, HttpClientModule],
  styleUrls: ['./chat-screen.component.css'],
})

export class ChatScreenComponent implements OnInit {
  @ViewChild('messageContainer') chatContainer!: ElementRef; // Reference to chat container
  curr_username: string = '';
  messageInput: string = '';
  curr_user_id: any;
  other_user_id: any;
  other_username: string = '';
  messages: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
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
        `http://localhost:8080/api/getMessages?user1=${this.curr_user_id}&user2=${this.other_user_id}`, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${jwt.getToken()}`  // Include the token in the Authorization header
        })
      })
      .subscribe(
        (response: any) => {
          this.messages = response;
          this.cdr.detectChanges();
          this.scrollToBottom();
        },
        (error) => {
          console.error('Error fetching messages:', error);
        }
      );

    // Subscribe to incoming WebSocket messages
    this.webSocketService.getMessages().subscribe((message_packet) => {

      if (message_packet != null && message_packet.sender_id === this.other_user_id)
        this.messages.push([
          message_packet.message,
          message_packet.sender_id
        ]);

      this.cdr.detectChanges();
      this.scrollToBottom();
    });
  }

  async getId(username: string): Promise<number> {
    const response = await lastValueFrom(
      this.http.get<number>(`http://localhost:8080/api/getId?username=${username}`, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${jwt.getToken()}`  // Include the token in the Authorization header
        })
      })
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

      const last_message_packet_1 = {
        user1: this.curr_username,
        user2: this.other_username,
        lastMessage: this.messageInput
      };

      const last_message_packet_2 = {
        user1: this.other_username,
        user2: this.curr_username,
        lastMessage: this.messageInput
      };

      // Send message via WebSocket
      this.webSocketService.sendMessage(JSON.stringify(message_packet)); // Send the entire message_packet

      // Optionally, add the sent message to the local messages array for immediate feedback
      this.messages.push([
        message_packet.message,
        message_packet.sender_id
      ]);
      this.cdr.detectChanges();
      this.scrollToBottom();

      // Send message to backend to save it in the database
      this.http.post('http://localhost:8080/api/saveMessage', message_packet, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${jwt.getToken()}`  // Include the token in the Authorization header
        })
      }).subscribe(
        (error) => {
          console.error('Error sending message:', error);
        }
      );

      // Send last message as sender to backend to save it in the database
      this.http.post('http://localhost:8080/api/saveLastMessage', last_message_packet_1, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${jwt.getToken()}`  // Include the token in the Authorization header
        })
      }).subscribe(
        (error) => {
          console.error('Error sending message:', error);
        }
      );

      // Send last message as receiver to backend to save it in the database
      this.http.post('http://localhost:8080/api/saveLastMessage', last_message_packet_2, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${jwt.getToken()}`  // Include the token in the Authorization header
        })
      }).subscribe(
        (error) => {
          console.error('Error sending message:', error);
        }
      );

      // Clear the input
      this.messageInput = '';
      this.scrollToBottom();
    }
  }

  goBack() {
    window.history.back();
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Failed to scroll to the bottom:', err);
    }
  }
}
