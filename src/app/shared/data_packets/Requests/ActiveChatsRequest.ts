export class ActiveChatsResponse {
    private username: string = "";
    private lastMessage: string = "";

    getUsername(): string {
        return this.username;
    }
    setUsername(username: string) {
        this.username = username;
    }
    getLastMessage(): string {
        return this.lastMessage;
    }
    setLastMessage(lastMessage: string) {
        this.lastMessage = lastMessage;
    }
} 