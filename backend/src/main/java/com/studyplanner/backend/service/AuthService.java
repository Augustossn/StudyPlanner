package com.studyplanner.backend.service;

import com.studyplanner.backend.dto.AuthDTO;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final EmailService emailService; 

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder, 
                       TokenService tokenService,
                       EmailService emailService) { 
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.emailService = emailService;
    }

    // --- REGISTRO ---
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userRepository.save(user);
        String token = tokenService.generateToken(savedUser);
        
        return new AuthDTO.AuthResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            token
        );
    }
    
    // --- LOGIN ---
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Senha incorreta");
        }
        
        String token = tokenService.generateToken(user);

        return new AuthDTO.AuthResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            token
        );
    }

    // --- ESQUECI A SENHA (Gera código) ---
    public void forgotPassword(String email){
        // Busca usuário, se não achar lança erro (ou não faz nada por segurança, mas aqui lançamos erro)
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Gera código de 6 dígitos
        String code = String.format("%06d", new Random().nextInt(999999));

        user.setRecoveryCode(code);
        user.setRecoveryExpiration(LocalDateTime.now().plusMinutes(15)); // Válido por 15 min

        userRepository.save(user);

        emailService.sendRecoveryEmail(email, code);
    }

    // --- VALIDAR CÓDIGO (Só checa se é válido) ---
    public boolean validateCode(String email, String code){
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (user.getRecoveryCode() == null || !user.getRecoveryCode().equals(code)){
            return false;
        }

        return !user.getRecoveryExpiration().isBefore(LocalDateTime.now());
    }

    // --- REDEFINIR SENHA (Usa o código para trocar a senha) ---
    public void resetPassword(String email, String code, String newPassword){
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (!validateCode(email, code)){
            throw new RuntimeException("Código inválido ou expirado");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        
        // Limpa o código para não ser usado novamente
        user.setRecoveryCode(null);
        user.setRecoveryExpiration(null);

        userRepository.save(user);
    }
}