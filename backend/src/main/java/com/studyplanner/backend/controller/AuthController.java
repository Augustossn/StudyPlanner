package com.studyplanner.backend.controller;

import com.studyplanner.backend.dto.AuthDTO;
import com.studyplanner.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // REGISTRO COM PROTEÇÃO DE ERRO
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO.RegisterRequest request) {
        try {
            AuthDTO.AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Se o email já existir, retorna 400 Bad Request com a mensagem
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // LOGIN COM PROTEÇÃO DE ERRO
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {
        try {
            AuthDTO.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Se senha incorreta, retorna 401 Unauthorized com a mensagem
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}