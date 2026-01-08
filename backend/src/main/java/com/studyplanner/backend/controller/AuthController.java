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

    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta no sistema. Se bem sucedido, retorna o token JWT para login imediato.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuário registrado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Erro de validação (ex: email já existe, senha curta)")
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

    @Operation(summary = "Realizar login", description = "Autentica o usuário com email e senha e retorna um token JWT válido.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
        @ApiResponse(responseCode = "401", description = "Credenciais inválidas (senha incorreta ou usuário inexistente)")
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

    @Operation(summary = "Solicitar recuperação de senha", description = "Gera um código de 6 dígitos e envia para o e-mail informado. Se o e-mail não existir, retorna sucesso mesmo assim por segurança.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Solicitação processada (verifique o e-mail)"),
        @ApiResponse(responseCode = "400", description = "Erro no envio do e-mail")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody RecoveryDTO.ForgotRequest request){
        try {
            authService.forgotPassword(request.email());
            return ResponseEntity.ok().build(); 
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Validar código de recuperação", description = "Verifica se o código informado pelo usuário é válido e não expirou.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Retorna true se o código for válido, false caso contrário")
    })
    @PostMapping("/validate-code")
    public ResponseEntity<?> validateCode(@RequestBody RecoveryDTO.ValidateRequest request) {
        boolean isValid = authService.validateCode(request.email(), request.code());
        return ResponseEntity.ok(isValid); 
    }

    @Operation(summary = "Redefinir senha", description = "Altera a senha do usuário. Requer o código de recuperação válido e a nova senha.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Senha alterada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Código inválido, expirado ou senha fora do padrão")
    })
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