export class GetUsernameResponse {
    private username: string = "";

    getUsername(): string {
        return this.username;
    }
    setUsername(username: string) {
        this.username = username;
    }
}