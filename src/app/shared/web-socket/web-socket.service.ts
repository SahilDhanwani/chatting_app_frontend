import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwt } from '../jwt/jwt'; // Import JWT utility

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private client: Client;
  private messageSubject: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
  private currentUserId: number | null = null;

  constructor() {
    const token = jwt.getToken(); // Get the JWT token

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8080/ws/chat?token=${token}`), // Add token as query parameter
      reconnectDelay: 5000, // Auto reconnect on failure
    });

    // Handle connection established
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

    // Handle WebSocket errors
    this.client.onStompError = (error) => {
      console.error('WebSocket error:', error);
    };

    this.client.activate(); // Activate WebSocket connection
  }

  setCurrentUserId(userId: number): void {
    this.currentUserId = userId;
  }

  sendMessage(message: string): void {
    this.client.publish({
      destination: '/app/send',
      body: message,
    });
  }

  getMessages(): Observable<any | null> {
    return this.messageSubject.asObservable();
  }
}
