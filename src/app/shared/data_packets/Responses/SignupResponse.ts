export class SignupResponse {
    private username:String = "";
    private password:String = "";
    private email:String = "";

    getUsername():String {
        return this.username;
    }
    setUsername(username:String) {
        this.username = username;
    }
    getPassword():String {
        return this.password;
    }
    setPassword(password:String) {
        this.password = password;
    }
    getEmail():String {
        return this.email;
    }
    setEmail(email:String) {
        this.email = email;
    }
}