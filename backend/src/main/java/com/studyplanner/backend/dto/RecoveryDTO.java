package com.studyplanner.backend.dto;

public class RecoveryDTO {

    // JSON: { "email": "fulano@gmail.com" }
    public record ForgotRequest(String email) {}

    // JSON: { "email": "fulano@gmail.com", "code": "123456" }
    public record ValidateRequest(String email, String code) {}

    // JSON: { "email": "fulano@gmail.com", "code": "123456", "newPassword": "senhaNova123" }
    public record ResetRequest(String email, String code, String newPassword) {}
}