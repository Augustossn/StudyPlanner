package com.studyplanner.backend.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.service.GoalService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    // GET: Listar metas com cálculo de progresso inteligente
    @Operation(summary = "Listar metas com progresso", description = "Calcula o progresso baseado em Assunto (Matters), Matéria ou Data.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getUserGoals(@PathVariable Long userId) {
        // Busca apenas as metas ativas
        List<Goal> goals = goalService.findGoalsByUserId(userId);
        return ResponseEntity.ok(goals);
    }

    // POST: Criar nova meta
    @PostMapping
    public ResponseEntity<?> createGoal(@Valid @RequestBody Goal goal) {
        try {
            Goal createdGoal = goalService.createGoal(goal);
            return ResponseEntity.ok(createdGoal);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT: Atualizar meta existente
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goalDetails) {
        return goalService.updateGoal(id, goalDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE: Apagar meta
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        try {
            goalService.deleteGoal(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}