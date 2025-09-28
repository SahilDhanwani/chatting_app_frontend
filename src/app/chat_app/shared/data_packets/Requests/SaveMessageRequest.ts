export class SaveMessageRequest {
    private message: string = "";
    private receiver_id: number = 0;
    private timestamp: string = new Date().toISOString();

    public getMessage(): string {
        return this.message;
    }

    public setMessage(message: string): void {
        this.message = message;
    }

    public getReceiver_id(): number {
        return this.receiver_id;
    }

    public setReceiver_id(receiver_id: number): void {
        this.receiver_id = receiver_id;
    }

    public getTimestamp(): string {
        return this.timestamp;
    }

    public setTimestamp(timestamp: string): void {
        this.timestamp = timestamp;
    }
}