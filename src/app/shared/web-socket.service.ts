import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;
  private messageSubject: Subject<any> = new Subject<any>();

  constructor() {
    // Initialize WebSocket connection
    this.socket = new WebSocket('ws://localhost:8080/chat'); // Make sure this URL matches your backend WebSocket URL

    // Handle incoming messages
    this.socket.onmessage = (event) => {
      this.messageSubject.next(event.data);
    };

    // Handle WebSocket connection open
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    // Handle WebSocket connection close
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  // Send message to WebSocket server
  sendMessage(message: string): void {
    this.socket.send(message);
  }

  // Get observable for incoming messages
  getMessages() {
    return this.messageSubject.asObservable();
  }
}
