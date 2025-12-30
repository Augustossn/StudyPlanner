package com.studyplanner.backend.service;

import com.studyplanner.backend.dto.AuthDTO;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService; // <--- 1. INJETAR ISSO
    
    // 2. ADICIONAR NO CONSTRUTOR
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userRepository.save(user);

        // 3. GERAR O TOKEN AQUI
        String token = tokenService.generateToken(savedUser);
        
        return new AuthDTO.AuthResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            token // <--- 4. ENVIAR O TOKEN NA RESPOSTA
        );
    }
    
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Senha incorreta");
        }
        
        // 3. GERAR O TOKEN AQUI TAMBÉM
        String token = tokenService.generateToken(user);

        return new AuthDTO.AuthResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            token // <--- 4. ENVIAR O TOKEN NA RESPOSTA
        );
    }
}