package com.studyplanner.backend.controller;

import com.studyplanner.backend.model.User;
import com.studyplanner.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Obter dados do usuário", description = "Retorna os detalhes do perfil do usuário pelo ID.")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Alterar senha", description = "Permite que um usuário logado troque sua própria senha.")
    @PatchMapping("/{id}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id, 
            @RequestBody ChangePasswordRequest request) {
        
        try {
            userService.changePassword(id, request.currentPassword(), request.newPassword());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

record ChangePasswordRequest(String currentPassword, String newPassword) {}