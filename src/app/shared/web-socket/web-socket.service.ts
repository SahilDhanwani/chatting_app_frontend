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
        this.setUpSocket(response);
      },
      (error) => {
        console.error('Authentication failed:', error);
        alert('You need to log in first');
      }
    );
  }

  setUpSocket(id: any): void {

    console.log('Setting up socket with id:', id);

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8080/ws/chat?id=${id}`, null, {
          withCredentials: true, // Send cookies with the request
        }),
      reconnectDelay: 5000, // Auto-reconnect on failure
    });


    this.client.onConnect = () => {
      if (this.currentUserId) {
        console.log('Subscribing to /user/queue/messages for user:', this.currentUserId);
    
        // Subscribe to user-specific queue
        this.client.subscribe(`/user/queue/messages`, (message: Message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log('Received message:', parsedMessage);
    
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
      this.client.publish({
        destination: '/app/send',
        body: message,
      });
    }
  }

  getMessages(): Observable<any | null> {
    return this.messageSubject.asObservable();
  }
}
