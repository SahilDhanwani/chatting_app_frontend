// features/redirect/external-redirect.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-external-redirect',
  imports: [],
  templateUrl: './external-redirect.component.html',
  styleUrl: './external-redirect.component.css'
})
export class ExternalRedirectComponent {
  ngOnInit(): void {
    window.location.href = 'https://github.com/SahilDhanwani/chatting_app_backend';
  }
}

