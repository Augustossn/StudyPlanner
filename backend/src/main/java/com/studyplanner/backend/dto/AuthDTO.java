package com.studyplanner.backend.dto;

public class AuthDTO {
    
    // --- LOGIN REQUEST ---
    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {}

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    // --- REGISTER REQUEST ---
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;

        public RegisterRequest() {}

        public RegisterRequest(String name, String email, String password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    // --- AUTH RESPONSE ---
    public static class AuthResponse {
        private Long userId;
        private String name;
        private String email;
        private String message;

        public AuthResponse() {}

        public AuthResponse(Long userId, String name, String email, String message) {
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.message = message;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}