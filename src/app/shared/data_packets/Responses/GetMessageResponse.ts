export class GetMessageResponse {
    private user1_id: number = 0;
    private user2_id: number = 0;

    getUser1_id(): number {
        return this.user1_id;
    }

    setUser1_id(user1_id: number) {
        this.user1_id = user1_id;
    }

    getUser2_id(): number {
        return this.user2_id;
    }

    setUser2_id(user2_id: number) {
        this.user2_id = user2_id;
    }
}