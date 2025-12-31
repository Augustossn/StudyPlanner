package com.studyplanner.backend.controller;

import com.studyplanner.backend.dto.AuthDTO;
import com.studyplanner.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta no sistema e retorna o token JWT para acesso imediato.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuário criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Erro de validação (ex: email já existente)")
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO.RegisterRequest request) {
        try {
            AuthDTO.AuthResponse response = authService.register(request); 
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Realizar login", description = "Autentica as credenciais do usuário e retorna o token JWT necessário para acessar as rotas protegidas.")
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

    @Operation(summary = "Esqueci a senha", description = "Gera um código de recuperação e o 'envia' (imprime no console) para o email informado.")
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody AuthDTO.ForgotPasswordRequest request){
        try {
            authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok("Código enviado para o email (verifique o console)");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Validar código", description = "Verifica se o código de 6 dígitos é válido e não expirou.")
    @PostMapping("/validate-code") // <--- CONFIRA SE ESTA LINHA ESTÁ AQUI
    public ResponseEntity<?> validateCode(@RequestBody AuthDTO.ValidateCodeRequest request) {
        boolean isValid = authService.validateCode(request.getEmail(), request.getCode());
        if (isValid) {
            return ResponseEntity.ok("Código válido");
        } else {
            return ResponseEntity.badRequest().body("Código inválido ou expirado");
        }
    }

    @Operation(summary = "Redefinir senha", description = "Recebe o código válido e a nova senha para efetuar a troca.")
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody AuthDTO.ResetPasswordRequest request){
        try {
            authService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
            return ResponseEntity.ok("Senha alterada com sucesso");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}