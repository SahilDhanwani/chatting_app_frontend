import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { GetUsernameResponse } from '../../../shared/data_packets/Responses/GetUsernameResponse';
import { ActiveChatsResponse } from '../../../shared/data_packets/Responses/ActiveChatsResponse';
import { GetAllUsernameResponse } from '../../../shared/data_packets/Responses/GetAllUsernameResponse';
import { environment } from '../../../shared/environment';

@Component({
  selector: 'app-chat-list',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
  providers: [GetUsernameResponse, ActiveChatsResponse, GetAllUsernameResponse]
})

export class ChatListComponent {

  ActiveChatsList: ActiveChatsResponse[] = [];
  isModalOpen = false;  // Controls whether the modal is open or closed
  searchText = '';  // Search text for filtering users
  baseUrl: string = environment.apiBaseUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private curr_username: GetUsernameResponse, //
    private allUsernames: GetAllUsernameResponse
  ) { }

  async ngOnInit(): Promise<void> {

    await this.http.get(`${this.baseUrl}/api/getUsername`, { withCredentials: true }).subscribe(
      (response: any) => {
        this.curr_username.setUsername(response.username);
      },
      (error) => {
        console.error(error);
        if (error.status === 403) {
          alert('Session Expired, Please login Again');
          this.router.navigate(['/auth/login']);
          return;
        }
      }
    )

    await this.http.get<any[]>(`${this.baseUrl}/api/activeChats`, { withCredentials: true }).subscribe(
      (response) => {
        this.ActiveChatsList = response.map((temp) => {
          const chat = new ActiveChatsResponse();
          chat.setUsername(temp.username);
          chat.setLastMessage(temp.lastMessage);
          return chat;
        });
        this.cdr.detectChanges();
      },
      (error) => {
        console.error(error);
        if (error.status === 403) {
          alert('Session Expired, Please login Again');
          this.router.navigate(['/auth/login']);
          return;
        }
      }
    )
  }

  newChat() {
    this.isModalOpen = true;
    this.http.get(`${this.baseUrl}/api/allUsernames`, { withCredentials: true }).subscribe(
      (response: any) => {
        this.allUsernames.setUsernames(response.usernames);
      },
      (error) => {
        console.error(error);
        if (error.status === 403) {
          alert('Session Expired, Please login Again');
          this.router.navigate(['/auth/login']);
          return;
        }
      }
    )
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // Filter users based on the search text
  filteredUsers() {
    return this.allUsernames.getUsernames().filter(username =>
      username.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Open the chat with a selected user
  openChat(select_username: string) {
    this.router.navigate(['/chat'], { state: { other_username: select_username } });
  }
}