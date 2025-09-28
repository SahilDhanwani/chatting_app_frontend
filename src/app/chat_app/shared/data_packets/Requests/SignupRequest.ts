export class SignupRequest {
    private username: string = "";
    private password: string = "";
    private email: string = "";

    getUsername(): string {
        return this.username;
    }
    setUsername(username: string) {
        this.username = username;
    }
    getPassword(): string {
        return this.password;
    }
    setPassword(password: string) {
        this.password = password;
    }
    getEmail(): string {
        return this.email;
    }
    setEmail(email: string) {
        this.email = email;
    }
}