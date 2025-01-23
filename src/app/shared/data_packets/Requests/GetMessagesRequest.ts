export class GetMessagesRequest {
    private message: string = "";
    private senderId: number = 0;

    getMessage(): string {
        return this.message;
    }

    setMessage(message: string) {
        this.message = message;
    }

    getSenderId(): number {
        return this.senderId;
    }

    setSenderId(senderId: number) {
        this.senderId = senderId;
    }
}