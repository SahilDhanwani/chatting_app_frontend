import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private client!: Client;
  private messageSubject: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
  private currentUserId: number | null = null;

  constructor(
    private http: HttpClient,
  ) {

    this.http.get('http://localhost:8080/api/validate', { withCredentials: true }).subscribe(
      (response) => {
        this.setUpSocket();
      },
      (error) => {
        console.error('Authentication failed:', error);
        alert('You need to log in first');
      }
    );
  }

  setUpSocket(): void {

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8080/ws/chat`, null, {
          withCredentials: true, // Send cookies with the request
        }),
      reconnectDelay: 5000, // Auto-reconnect on failure
    });


    this.client.onConnect = () => {
      console.log('WebSocket connected');
      if (this.currentUserId) {
        this.client.subscribe(`/topic/${this.currentUserId}/messages`, (message: Message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            if (parsedMessage.receiver_id === this.currentUserId) {
              this.messageSubject.next(parsedMessage);
            }
          } catch (error) {
            console.error('Error parsing message body:', error);
          }
        });
      }
    };

    this.client.onStompError = (error) => {
      console.error('WebSocket error:', error);
    };

    this.client.activate();
  }

  setCurrentUserId(userId: number): void {
    this.currentUserId = userId;
  }

  sendMessage(message: string): void {

    if (this.client && this.client.connected) {
      console.log('Sending message. Connected hai:', message);
    }
    this.client.publish({
      destination: '/app/send',
      body: message,
    });

    console.log('Message sent after publish:', message);
  }

  getMessages(): Observable<any | null> {
    return this.messageSubject.asObservable();
  }
}
