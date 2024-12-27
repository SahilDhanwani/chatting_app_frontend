import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class WebSocketService {
  private client: Client;
  private messageSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor() {
    // Initialize Stomp Client with SockJS
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat'),
      reconnectDelay: 5000, // Automatically reconnect on failure
    });

    // Handle connection established
    this.client.onConnect = () => {
      console.log('WebSocket connection established');
      this.client.subscribe('/topic/messages', (message: Message) => {
        const newMessage = JSON.parse(message.body);
        this.messageSubject.next([...this.messageSubject.value, newMessage]);
      });
    };

    // Handle connection error
    this.client.onStompError = (error) => {
      console.error('WebSocket error:', error);
    };

    // Activate the connection
    this.client.activate();
  }

  // Send a message to the WebSocket server
  sendMessage(message: any): void {
    this.client.publish({
      destination: '/app/send',
      body: JSON.stringify(message),
    });
  }

  // Get an observable for messages
  getMessages(): Observable<any[]> {
    return this.messageSubject.asObservable();
  }
}
