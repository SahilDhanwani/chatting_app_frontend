export class LoginResponse {
    private username:String = "";
    private password:String = "";
    
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
}