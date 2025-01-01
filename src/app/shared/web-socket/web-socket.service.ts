import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private client: Client;
  private messageSubject: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
  private currentUserId: number | null = null;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat'),  // Spring Boot WebSocket endpoint
      reconnectDelay: 5000,  // Auto reconnect on failure
    });

    // Handle connection established
    this.client.onConnect = () => {
      console.log('WebSocket connected');
      // Subscribe to '/topic/messages' to receive messages
      this.client.subscribe(`/topic/${this.currentUserId}/messages`, (message: Message) => {
        try {
          const parsedMessage = JSON.parse(message.body); // Parse the message body

          console.log('Parsed message after json:', parsedMessage);

          // Only accept messages intended for the current user
          if (parsedMessage.receiver_id === this.currentUserId) {
            this.messageSubject.next(parsedMessage); // Save only the latest message
          }
        } catch (error) {
          console.error('Error parsing message body:', error);
        }
      });
    };

    // Handle WebSocket connection errors
    this.client.onStompError = (error) => {
      console.error('WebSocket error:', error);
    };

    // Activate WebSocket connection
    this.client.activate();
  }

  setCurrentUserId(userId: number): void {
    this.currentUserId = userId;
  }

  // Send a message to the server
  sendMessage(message: string): void {
    this.client.publish({
      destination: '/app/send',  // STOMP message destination
      body: message,  // The message itself
    });
  }

  // Get the observable of the latest message
  getMessages(): Observable<any | null> {
    return this.messageSubject.asObservable();
  }
}
