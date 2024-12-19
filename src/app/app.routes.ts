import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Default route (Home Page)
    { path: 'auth/login', component: LoginComponent },
    {path: 'auth/signup', component: SignupComponent },
    { path: '**', redirectTo: '' } // Redirect to Home Page if route doesn't exist

];
