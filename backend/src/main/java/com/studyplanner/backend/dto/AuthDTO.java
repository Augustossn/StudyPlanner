package com.studyplanner.backend.dto;

public class AuthDTO {
    
    // --- LOGIN REQUEST (Sem alterações) ---
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
    
    // --- REGISTER REQUEST (Sem alterações) ---
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
    
    // --- AUTH RESPONSE (ATUALIZADO COM TOKEN) ---
    public static class AuthResponse {
        private Long userId;
        private String name;
        private String email;
        private String token; // <--- 1. NOVO CAMPO TOKEN

        public AuthResponse() {}

        // 2. CONSTRUTOR ATUALIZADO (Recebe token em vez de message)
        public AuthResponse(Long userId, String name, String email, String token) {
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.token = token;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        // 3. GETTER E SETTER DO NOVO CAMPO
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public static class ForgotPasswordRequest {
        private String email;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // 2. Validação do código (Email + Código)
    public static class ValidateCodeRequest {
        private String email;
        private String code;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    // 3. Troca de senha (Email + Código + Nova Senha)
    public static class ResetPasswordRequest {
        private String email;
        private String code;
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}