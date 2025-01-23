export class saveLastMessageResponse {
    private username1: string = "";
    private username2: string = "";
    private lastMessage: string = "";

    getUsername1(): string {
        return this.username1;
    }

    setUsername1(username1: string) {
        this.username1 = username1;
    }

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