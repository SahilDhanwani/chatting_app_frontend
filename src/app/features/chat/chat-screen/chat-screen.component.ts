import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { WebSocketService } from '../../../shared/web-socket/web-socket.service'; // Import the WebSocketService
import { SaveMessageRequest } from '../../../shared/data_packets/Requests/SaveMessageRequest';
import { saveLastMessageRequest } from '../../../shared/data_packets/Requests/SaveLastMessageRequest';
import { GetMessagesResponse } from '../../../shared/data_packets/Responses/GetMessagesResponse';
import { WebSocketMessage } from '../../../shared/data_packets/WebSocketMessage';
@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  imports: [FormsModule, CommonModule, HttpClientModule],
  styleUrls: ['./chat-screen.component.css'],
  providers: [
    WebSocketService,
    SaveMessageRequest,
    saveLastMessageRequest,
    GetMessagesResponse,
    WebSocketMessage
  ]
})

export class ChatScreenComponent implements OnInit {
  @ViewChild('messageContainer') chatContainer!: ElementRef; // Reference to chat container
  messageInput: string = '';
  curr_user_id: any;
  other_user_id: any;
  other_username: string = '';
  messages: GetMessagesResponse[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private SaveMessageRequest: SaveMessageRequest,
    private SaveLastMessageRequest: saveLastMessageRequest,
    private WebSocketMessage: WebSocketMessage
  ) { }

  async ngOnInit() {

    const state = window.history.state;
    this.other_username = state.other_username;

    try {
      const response: any = await lastValueFrom(
        this.http.get<number>(`http://localhost:8080/api/getIdByUsername?username=${this.other_username}`, { withCredentials: true })
      );
      console.log('I was called inside try block')
      this.other_user_id = response.id;
    } catch (error) {
      const err = error as any;
      if (err.status === 403) {
        alert('Session Expired, Please login Again');
        this.router.navigate(['/auth/login']);
        return;
      }
      console.error('Error fetching user ID:', err);
      return;
    }

    try {
      const response: any = await lastValueFrom(
        this.http.get<number>(`http://localhost:8080/api/getId`, { withCredentials: true })
      );
      this.curr_user_id = response.id;
    } catch (error) {
      const err = error as any;
      if (err.status === 403) {
        alert('Session Expired, Please login Again');
        this.router.navigate(['/auth/login']);
        return;
      }
      console.error('Error fetching user ID:', err);
      return;
    }

    this.webSocketService.setCurrentUserId(this.curr_user_id);

    // Fetch initial messages from the database
    this.http.get<any[]>(`http://localhost:8080/api/getMessages?user2=${this.other_user_id}`, { withCredentials: true }).subscribe(
      (response) => {
        this.messages = response.map((msg) => {
          const message = new GetMessagesResponse();
          message.setMessage(msg.message);
          message.setSenderId(msg.senderId);
          return message;
        });
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      (error) => {
        if (error.status === 403) {
          alert('Session Expired, Please login Again');
          this.router.navigate(['/auth/login']);
          return;
        }
        console.error('Error fetching messages:', error);
      }
    );

    // Subscribe to incoming WebSocket messages
    this.webSocketService.getMessages().subscribe((message_packet) => {

      console.log(message_packet.message);
      console.log(message_packet.sender_id);
      console.log(message_packet.receiver_id);

      if (message_packet != null && message_packet.sender_id === this.other_user_id && message_packet.receiver_id === this.curr_user_id) {
        const message = new GetMessagesResponse();
        message.setMessage(message_packet.message);
        message.setSenderId(message_packet.sender_id);

        this.messages.push(message);

        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  sendMessage() {
    if (this.messageInput.trim()) {

      this.WebSocketMessage.setSender_id(this.curr_user_id);
      this.WebSocketMessage.setReceiver_id(this.other_user_id);
      this.WebSocketMessage.setMessage(this.messageInput);

      // Send message via WebSocket
      this.webSocketService.sendMessage(JSON.stringify(this.WebSocketMessage));

      // Optionally, add the sent message to the local messages array for immediate feedback
      if (this.other_user_id !== this.curr_user_id) {
        const message = new GetMessagesResponse();
        message.setMessage(this.messageInput);
        message.setSenderId(this.curr_user_id);

        this.messages.push(message);
        this.cdr.detectChanges();
        this.scrollToBottom();
      }

      this.SaveMessageRequest.setMessage(this.messageInput);
      this.SaveMessageRequest.setReceiver_id(this.other_user_id);
      this.SaveMessageRequest.setTimestamp(new Date().toISOString());
      // Send message to backend to save it in the database
      this.http.post('http://localhost:8080/api/saveMessage', this.SaveMessageRequest, { withCredentials: true }).subscribe(
        (Response) => { },
        (error) => {
          if (error.status === 403) {
            alert('Session Expired, Please login Again');
            this.router.navigate(['/auth/login']);
          }
          console.error('Error sending message:', error);
        }
      );

      // this.SaveLastMessageRequest.setUsername1(this.curr_username);
      this.SaveLastMessageRequest.setUsername2(this.other_username);
      this.SaveLastMessageRequest.setLastMessage(this.messageInput);

      // Send last message as sender to backend to save it in the database
      this.http.post('http://localhost:8080/api/saveLastMessage', this.SaveLastMessageRequest, { withCredentials: true }).subscribe(
        (Response) => { },
        (error) => {
          if (error.status === 403) {
            alert('Session Expired, Please login Again');
            this.router.navigate(['/auth/login']);
          }
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
