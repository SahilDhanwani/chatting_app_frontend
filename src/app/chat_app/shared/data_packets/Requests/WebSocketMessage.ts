export class WebSocketMessage {
    private message: string = "";
    private sender_id: number = 0;
    private receiver_id: number = 0;

    public getMessage(): string {
        return this.message;
    }

    public setMessage(message: string): void {
        this.message = message;
    }

    public getSender_id(): number {
        return this.sender_id;
    }

    public setSender_id(sender_id: number): void {
        this.sender_id = sender_id;
    }

    public getReceiver_id(): number {
        return this.receiver_id;
    }

    public setReceiver_id(receiver_id: number): void {
        this.receiver_id = receiver_id;
    }
}