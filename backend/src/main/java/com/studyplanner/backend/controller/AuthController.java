package com.studyplanner.backend.controller;

import com.studyplanner.backend.dto.AuthDTO;
import com.studyplanner.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // construtor
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // post para registrar um novo usuário
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO.RegisterRequest request) {
        try {
            // atribui a response a requisição de um novo usuário, caso positivo, retorna um 200 com o usuário cadastrado
            AuthDTO.AuthResponse response = authService.register(request); 
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // caso negativo, retorna um 400 com a mensagem de erro
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // post para realizar o login de um usuário já cadastrado
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {
        try {
            // atribui a response a requisição de login do authService, caso positivo, retorna 200 com o usuário logado
            AuthDTO.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // caso negativo, retorna um 401 (Unauthorized) com a mensagem de erro
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}