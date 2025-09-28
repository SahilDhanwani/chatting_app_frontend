export class saveLastMessageRequest {
    private username2: string = "";
    private lastMessage: string = "";

    getUsername2(): string {
        return this.username2;
    }

    setUsername2(username2: string) {
        this.username2 = username2;
    }

    getLastMessage(): string {
        return this.lastMessage;
    }

    setLastMessage(lastMessage: string) {
        this.lastMessage = lastMessage;
    }
}