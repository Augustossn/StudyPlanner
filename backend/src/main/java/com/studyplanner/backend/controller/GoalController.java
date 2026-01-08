package com.studyplanner.backend.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @Operation(summary = "Listar metas do usuário", description = "Retorna todas as metas ativas e inativas de um usuário específico, calculando o progresso atual baseado nas sessões de estudo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de metas retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getUserGoals(@PathVariable Long userId) {
        List<Goal> goals = goalService.findGoalsByUserId(userId);
        return ResponseEntity.ok(goals);
    }

    @Operation(summary = "Criar nova meta", description = "Cadastra uma nova meta de estudo. Requer título, horas alvo, tipo (Semanal/Mensal) e data de início.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Meta criada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos (ex: data nula, horas negativas) ou usuário inexistente")
    })
    @PostMapping
    public ResponseEntity<?> createGoal(@Valid @RequestBody Goal goal) {
        try {
            Goal createdGoal = goalService.createGoal(goal);
            return ResponseEntity.ok(createdGoal);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Atualizar meta existente", description = "Atualiza os dados de uma meta pelo ID. Permite alterar título, horas alvo, datas e status (ativa/inativa).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Meta atualizada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Meta não encontrada")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goalDetails) {
        return goalService.updateGoal(id, goalDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Excluir meta", description = "Remove uma meta do sistema pelo ID. Atenção: isso não apaga as sessões de estudo vinculadas, apenas a meta.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Meta excluída com sucesso"),
        @ApiResponse(responseCode = "404", description = "Meta não encontrada")
    })
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