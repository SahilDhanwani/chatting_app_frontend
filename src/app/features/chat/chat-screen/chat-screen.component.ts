import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { WebSocketService } from '../../../shared/web-socket/web-socket.service'; // Import the WebSocketService
import { GetMessageResponse } from '../../../shared/data_packets/Responses/GetMessageResponse';
import { GetIdResponse } from '../../../shared/data_packets/Responses/GetIdResponse';
import { SaveMessageResponse } from '../../../shared/data_packets/Responses/SaveMessageResponse';
import { saveLastMessageResponse } from '../../../shared/data_packets/Responses/SaveLastMessageResponse';
import { GetMessagesRequest } from '../../../shared/data_packets/Requests/GetMessagesRequest';
@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  imports: [FormsModule, CommonModule, HttpClientModule],
  styleUrls: ['./chat-screen.component.css'],
  providers: [
    WebSocketService, 
    GetMessageResponse, 
    GetIdResponse, 
    SaveMessageResponse, 
    saveLastMessageResponse,
    GetMessagesRequest]
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
    private router: Router,
    private http: HttpClient,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private GetMessageResponse: GetMessageResponse,
    private GetIdResponse: GetIdResponse,
    private SaveMessageResponse: SaveMessageResponse,
    private SaveLastMessageResponse: saveLastMessageResponse,
    private GetMessageRequest: GetMessagesRequest

  ) { }

  async ngOnInit() {

    const state = window.history.state;
    this.curr_username = state.curr_username;
    this.other_username = state.other_username;

    this.curr_user_id = await this.getId(this.curr_username);
    this.other_user_id = await this.getId(this.other_username);

    this.webSocketService.setCurrentUserId(this.curr_user_id);

    this.GetMessageResponse.setUser1_id(this.curr_user_id);
    this.GetMessageResponse.setUser2_id(this.other_user_id);

    // Fetch initial messages from the database
    this.http
      .get(
        `http://localhost:8080/api/getMessages?form_data=${this.GetMessageResponse}`,
        { withCredentials: true }).subscribe(
          (response: any) => {
            this.messages = response;
            this.cdr.detectChanges();
            this.scrollToBottom();
          },
          (error) => {
            if (error.status === 403) {
              alert('Session Expired, Please login Again');
              this.router.navigate(['/auth/login']);
            }
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
    try {
      this.GetIdResponse.setUsername(username);
      const response = await lastValueFrom(
        this.http.get<number>(`http://localhost:8080/api/getId?form_data=${this.GetIdResponse}`, { withCredentials: true })
      );
      return response;
    } catch (error) {
      const err = error as any;
      if (err.status === 403) {
        alert('Session Expired, Please login Again');
        this.router.navigate(['/auth/login']);
      }
      return -1;
    }
  }

  sendMessage() {
    if (this.messageInput.trim()) {

      // Send message via WebSocket
      this.webSocketService.sendMessage(JSON.stringify(this.SaveMessageResponse));

      // Optionally, add the sent message to the local messages array for immediate feedback
      this.messages.push([
        this.messageInput,
        this.curr_user_id
      ]);

      this.cdr.detectChanges();
      this.scrollToBottom();

      this.SaveMessageResponse.setMessage(this.messageInput);
      this.SaveMessageResponse.setSender_id(this.curr_user_id);
      this.SaveMessageResponse.setReceiver_id(this.other_user_id);
      this.SaveMessageResponse.setTimestamp(new Date().toISOString());

      // Send message to backend to save it in the database
      this.http.post('http://localhost:8080/api/saveMessage', this.SaveMessageResponse, { withCredentials: true }).subscribe(
        (Response) => { },
        (error) => {
          if (error.status === 403) {
            alert('Session Expired, Please login Again');
            this.router.navigate(['/auth/login']);
          }
          console.error('Error sending message:', error);
        }
      );

      this.SaveLastMessageResponse.setUsername1(this.curr_username);
      this.SaveLastMessageResponse.setUsername2(this.other_username);
      this.SaveLastMessageResponse.setLastMessage(this.messageInput);

      // Send last message as sender to backend to save it in the database
      this.http.post('http://localhost:8080/api/saveLastMessage', this.SaveLastMessageResponse, { withCredentials: true }).subscribe(
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
