import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { ChatListComponent } from './features/chat/chat-list/chat-list.component';
import { ChatScreenComponent } from './features/chat/chat-screen/chat-screen.component';
import { ExternalRedirectComponent } from './features/redirect/external-redirect/external-redirect.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Default route (Home Page)
    { path: 'home', component: HomeComponent },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/signup', component: SignupComponent },
    { path: 'chatlist', component: ChatListComponent },
    { path: 'chat', component: ChatScreenComponent },
    { path: 'code', component: ExternalRedirectComponent },

    { path: '**', redirectTo: '' }

];
