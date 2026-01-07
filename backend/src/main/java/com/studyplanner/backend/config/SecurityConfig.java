package com.studyplanner.backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean; // Importe isso
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Configuração de CORS (Fundamental para o React conectar)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. Desabilita CSRF (Padrão para APIs REST)
            .csrf(AbstractHttpConfigurer::disable)
            
            // 3. Gerenciamento de Rotas
            .authorizeHttpRequests(auth -> auth
                // Explícito: Todo mundo pode acessar rotas de autenticação (Login, Registro, Recuperação)
                .requestMatchers("/api/auth/**").permitAll()
                
                // Swagger (Opcional, mas útil se você usa)
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()

                // Para Desenvolvimento: Libera tudo. 
                // No futuro, trocaremos por .anyRequest().authenticated()
                .anyRequest().permitAll() 
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Aceita requisições de QUALQUER origem (localhost:5173, etc)
        configuration.setAllowedOriginPatterns(List.of("*"));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}