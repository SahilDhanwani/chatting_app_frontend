import { jwtDecode } from 'jwt-decode';

export class jwt {

    // Get the token from sessionStorage
    public static getToken(): string | null {
        return sessionStorage.getItem('jwt');
    }

    // Set the token to sessionStorage
    public static setToken(token: string) {
        sessionStorage.setItem('jwt', token);
    }

    // Clear the token from sessionStorage
    public static clearToken() {
        sessionStorage.removeItem('jwt');
        console.log("Token cleared from sessionStorage!");
    }

    public static getId() {
        const token = sessionStorage.getItem('jwt');
        if (token) {
            const decoded: any = jwtDecode(token);
            return decoded.sub;
        }
        return null;
    }
}
