import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Default route (Home Page)
    { path: 'auth/login', component:LoginComponent }, // Redirect unknown routes to Home
];
