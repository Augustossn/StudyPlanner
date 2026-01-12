package com.studyplanner.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.studyplanner.backend.dto.AuthDTO;
import com.studyplanner.backend.dto.RecoveryDTO;
import com.studyplanner.backend.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta e retorna o token JWT.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Registrado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Erro de validação ou email duplicado")
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        try {
            AuthDTO.AuthResponse response = authService.register(request); 
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Realizar login", description = "Autentica e retorna token JWT.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login com sucesso"),
        @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {
        try {
            AuthDTO.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @Operation(summary = "Esqueci minha senha", description = "Envia código de recuperação por email.")
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody RecoveryDTO.ForgotRequest request){
        try {
            authService.forgotPassword(request.email());
            return ResponseEntity.ok().build(); 
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Validar código", description = "Verifica se o código de recuperação é válido.")
    @PostMapping("/validate-code")
    public ResponseEntity<?> validateCode(@RequestBody RecoveryDTO.ValidateRequest request) {
        boolean isValid = authService.validateCode(request.email(), request.code());
        return ResponseEntity.ok(isValid); 
    }

    @Operation(summary = "Redefinir senha", description = "Troca a senha usando o código de recuperação.")
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody RecoveryDTO.ResetRequest request){
        try {
            authService.resetPassword(request.email(), request.code(), request.newPassword());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}