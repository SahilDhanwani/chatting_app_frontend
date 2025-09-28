export class GetAllUsernameResponse {
    private usernames: string[] = [];

    getUsernames(): string[] {
        return this.usernames;
    }

    setUsernames(usernames: string[]) {
        this.usernames = usernames;
    }
}