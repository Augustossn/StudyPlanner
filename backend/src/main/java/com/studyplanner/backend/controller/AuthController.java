package com.studyplanner.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping; // <--- Importante!
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studyplanner.backend.dto.AuthDTO;
import com.studyplanner.backend.dto.RecoveryDTO;
import com.studyplanner.backend.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // --- ROTAS DE REGISTRO E LOGIN (Mantidas iguais, só limpando imports) ---

    @Operation(summary = "Registrar novo usuário")
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        try {
            AuthDTO.AuthResponse response = authService.register(request); 
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Realizar login")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {
        try {
            AuthDTO.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // --- NOVAS ROTAS DE RECUPERAÇÃO DE SENHA (Usando RecoveryDTO) ---

    @Operation(summary = "Esqueci a senha", description = "Envia código de recuperação por e-mail.")
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody RecoveryDTO.ForgotRequest request){
        try {
            // Nota: Em records usamos .email() e não .getEmail()
            authService.forgotPassword(request.email());
            return ResponseEntity.ok().build(); // Retorna 200 OK sem corpo
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Validar código", description = "Verifica se o código é válido.")
    @PostMapping("/validate-code")
    public ResponseEntity<?> validateCode(@RequestBody RecoveryDTO.ValidateRequest request) {
        // Nota: .email() e .code()
        boolean isValid = authService.validateCode(request.email(), request.code());
        return ResponseEntity.ok(isValid); // Retorna true ou false
    }

    @Operation(summary = "Redefinir senha", description = "Troca a senha usando o código validado.")
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody RecoveryDTO.ResetRequest request){
        try {
            // Nota: .newPassword()
            authService.resetPassword(request.email(), request.code(), request.newPassword());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}