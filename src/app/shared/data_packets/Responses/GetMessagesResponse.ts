export class GetMessagesResponse {
    private message: string = "";
    private sender_id: number = 0;

    getMessage(): string {
        return this.message;
    }

    setMessage(message: string) {
        this.message = message;
    }

    getSenderId(): number {
        return this.sender_id;
    }

    setSenderId(sender_id: number) {
        this.sender_id = sender_id;
    }
}