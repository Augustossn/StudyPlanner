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
    private final EmailService emailService; // 1. Injeção do serviço de email

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder, 
                       TokenService tokenService,
                       EmailService emailService) { // 2. Adicionado ao construtor
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.emailService = emailService;
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
        String token = tokenService.generateToken(savedUser);
        
        return new AuthDTO.AuthResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            token
        );
    }
    
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

    public void forgotPassword(String email){
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        String code = String.format("%06d", new Random().nextInt(999999));

        user.setRecoveryCode(code);
        user.setRecoveryExpiration(LocalDateTime.now().plusMinutes(15));

        userRepository.save(user);

        // 3. Uso real do envio de email (substituindo o System.out)
        emailService.sendRecoveryEmail(email, code);
    }

    public boolean validateCode(String email, String code){
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verifica se o código é nulo ou não bate
        if (user.getRecoveryCode() == null || !user.getRecoveryCode().equals(code)){
            return false;
        }

        // 4. CORREÇÃO DO AVISO: Retorna true se a data NÃO for antes de agora (ou seja, se ainda for válida)
        return !user.getRecoveryExpiration().isBefore(LocalDateTime.now());
    }

    public void resetPassword(String email, String code, String newPassword){
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (!validateCode(email, code)){
            throw new RuntimeException("Código inválido ou expirado");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setRecoveryCode(null);
        user.setRecoveryExpiration(null);

        userRepository.save(user);
    }
}