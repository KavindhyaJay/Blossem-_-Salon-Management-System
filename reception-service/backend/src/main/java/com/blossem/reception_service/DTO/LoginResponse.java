package com.blossem.reception_service.DTO;

public class LoginResponse {

    private final String token;
    private final String userName;
    private final String email;
    private final String role;

    public LoginResponse(String token, String userName, String email, String role) {
        this.token = token;
        this.userName = userName;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getUserName() {
        return userName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
