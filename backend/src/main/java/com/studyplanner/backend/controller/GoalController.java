package com.studyplanner.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping; // <--- Importante
import org.springframework.web.bind.annotation.RequestBody; // <--- Importante
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.GoalRepository;
import com.studyplanner.backend.repository.StudySessionRepository;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudySessionRepository sessionRepository;

    public GoalController(GoalRepository goalRepository, UserRepository userRepository, StudySessionRepository sessionRepository, SubjectRepository subjectRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.subjectRepository = subjectRepository;
    }

    // GET: Obter goals
    @Operation(summary = "Listar metas com progresso", description = "Retorna as metas ativas do usuário e calcula dinamicamente a porcentagem de conclusão baseada nas sessões de estudo registradas.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de metas retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado (se validado) ou lista vazia")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getUserGoals(@PathVariable Long userId) {
        List<Goal> goals = goalRepository.findByUser_IdAndActiveTrue(userId);

        for (Goal goal : goals) {
            Integer totalMinutes = 0; // Começa zerado

            // 1. Decide qual cálculo usar
            if (goal.getSubject() != null) {
                // Cálculo por Matéria
                totalMinutes = sessionRepository.getTotalMinutesBySubject(userId, goal.getSubject().getId());
            } else if (goal.getStartDate() != null) {
                // Cálculo Genérico por Data
                LocalDateTime start = goal.getStartDate().atStartOfDay();
                LocalDateTime end = (goal.getEndDate() != null) 
                        ? goal.getEndDate().atTime(23, 59, 59) 
                        : LocalDateTime.now();
                totalMinutes = sessionRepository.getTotalMinutesByDateRange(userId, start, end);
            }

            // 2. Blindagem extra (caso o repositório falhe em retornar 0)
            if (totalMinutes == null) totalMinutes = 0;

            // 3. Matemática
            double hoursDone = totalMinutes / 60.0;
            goal.setCurrentHours(Math.round(hoursDone * 10.0) / 10.0);

            if (goal.getTargetHours() != null && goal.getTargetHours() > 0) {
                int percent = (int) ((hoursDone / goal.getTargetHours()) * 100);
                goal.setProgressPercentage(Math.min(percent, 100));
            } else {
                goal.setProgressPercentage(0);
            }
        }
        return ResponseEntity.ok(goals);
    }

    // POST: Criar goal
    @Operation(summary = "Cadastrar nova meta", description = "Cria uma nova meta de estudos vinculada a um usuário existente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Meta criada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou Usuário não encontrado")
    })
    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal) {
        if (goal.getUser() == null || goal.getUser().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<User> userOptional = userRepository.findById(goal.getUser().getId());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        goal.setUser(userOptional.get());

        if (goal.getSubject() != null && goal.getSubject().getId() != null){
            Optional<Subject> sub = subjectRepository.findById(goal.getSubject().getId());
            if(sub.isPresent()){
                goal.setSubject(sub.get());
            } else {
                goal.setSubject(null);
            }
        }

        Goal savedGoal = goalRepository.save(goal);
        return ResponseEntity.ok(savedGoal);
    }

    // PUT: Atualizar goal
    @Operation(summary = "Atualizar meta existente", description = "Atualiza campos como título, horas alvo e datas de uma meta específica.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Meta atualizada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Meta não encontrada para o ID informado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goal) {
        Optional<Goal> existingGoal = goalRepository.findById(id);
        if (existingGoal.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Goal updatedGoal = existingGoal.get();
        updatedGoal.setTitle(goal.getTitle());
        updatedGoal.setGoalType(goal.getGoalType());
        updatedGoal.setTargetHours(goal.getTargetHours());
        updatedGoal.setStartDate(goal.getStartDate());
        updatedGoal.setEndDate(goal.getEndDate());
        updatedGoal.setActive(goal.isActive());
        
        if (goal.getSubject() != null && goal.getSubject().getId() != null){
            Optional<Subject> sub = subjectRepository.findById(goal.getSubject().getId());
            updatedGoal.setSubject(sub.orElse(null));
        } else {
            updatedGoal.setSubject(null);
        }

        Goal savedGoal = goalRepository.save(updatedGoal);
        return ResponseEntity.ok(savedGoal);
    }

    // DELETE: Apagar goal
    @Operation(summary = "Excluir meta", description = "Remove permanentemente uma meta do banco de dados.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Meta excluída com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}