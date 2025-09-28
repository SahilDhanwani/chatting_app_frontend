import { Routes } from '@angular/router';
import { HomeComponent } from './chat_app/features/home/home.component';
import { LoginComponent } from './chat_app/features/auth/login/login.component';
import { SignupComponent } from './chat_app/features/auth/signup/signup.component';
import { ChatListComponent } from './chat_app/features/chat/chat-list/chat-list.component';
import { ChatScreenComponent } from './chat_app/features/chat/chat-screen/chat-screen.component';
import { ExternalRedirectComponent } from './chat_app/features/redirect/external-redirect/external-redirect.component';
import { PhotoEditorComponent } from './photo_editor/photo-editor/photo-editor.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Default route (Home Page)
    { path: 'home', component: HomeComponent },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/signup', component: SignupComponent },
    { path: 'chatlist', component: ChatListComponent },
    { path: 'chat', component: ChatScreenComponent },
    { path: 'photo-editor', component: PhotoEditorComponent },
    { path: 'code', component: ExternalRedirectComponent },

    { path: '**', redirectTo: '' }

];
