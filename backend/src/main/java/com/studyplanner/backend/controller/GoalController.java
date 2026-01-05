package com.studyplanner.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    // GET: Listar metas com cálculo de progresso inteligente
    @Operation(summary = "Listar metas com progresso", description = "Calcula o progresso baseado em Assunto (Matters), Matéria ou Data.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getUserGoals(@PathVariable Long userId) {
        // Busca apenas as metas ativas
        List<Goal> goals = goalRepository.findByUser_IdAndActiveTrue(userId);

        for (Goal goal : goals) {
            Integer totalMinutes = 0;

            // --- LÓGICA DE PRIORIDADE DE CÁLCULO ---

            // 1. Nível Mais Específico: Matéria + Assunto (Matters)
            // Verifica se tem matéria E se o campo matters tem texto real (sem ser só espaços)
            if (goal.getSubject() != null && goal.getMatters() != null && !goal.getMatters().trim().isEmpty()) {
                totalMinutes = sessionRepository.getTotalMinutesByMatter(
                    userId, 
                    goal.getSubject().getId(), 
                    goal.getMatters().trim() // Remove espaços extras por segurança
                );
            } 
            // 2. Nível Médio: Apenas Matéria
            // Se cair aqui, é porque NÃO tem assunto específico, então soma a matéria toda
            else if (goal.getSubject() != null) {
                totalMinutes = sessionRepository.getTotalMinutesBySubject(
                    userId, 
                    goal.getSubject().getId()
                );
            } 
            // 3. Nível Geral: Por Intervalo de Datas
            // Metas genéricas tipo "Estudar 20h essa semana"
            else if (goal.getStartDate() != null) {
                LocalDateTime start = goal.getStartDate().atStartOfDay();
                LocalDateTime end = (goal.getEndDate() != null) 
                        ? goal.getEndDate().atTime(23, 59, 59) 
                        : LocalDateTime.now();
                
                totalMinutes = sessionRepository.getTotalMinutesByDateRange(userId, start, end);
            }

            // Segurança: Se o banco retornar null (sem sessões), assumimos 0
            if (totalMinutes == null) totalMinutes = 0;

            // --- CÁLCULOS MATEMÁTICOS ---
            double hoursDone = totalMinutes / 60.0;
            goal.setCurrentHours(Math.round(hoursDone * 10.0) / 10.0);

            // Calcula porcentagem (0 a 100)
            if (goal.getTargetHours() != null && goal.getTargetHours() > 0) {
                int percent = (int) ((hoursDone / goal.getTargetHours()) * 100);
                goal.setProgressPercentage(Math.min(percent, 100));
            } else {
                goal.setProgressPercentage(0);
            }
        }
        return ResponseEntity.ok(goals);
    }

    // POST: Criar nova meta
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

        // Vincula Matéria
        if (goal.getSubject() != null && goal.getSubject().getId() != null){
            Optional<Subject> sub = subjectRepository.findById(goal.getSubject().getId());
            goal.setSubject(sub.orElse(null));
        } else {
            goal.setSubject(null);
        }
        
        // Limpa espaços em branco do assunto se houver
        if (goal.getMatters() != null) {
            goal.setMatters(goal.getMatters().trim());
        }

        Goal savedGoal = goalRepository.save(goal);
        return ResponseEntity.ok(savedGoal);
    }

    // PUT: Atualizar meta existente
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goal) {
        Optional<Goal> existingGoalOpt = goalRepository.findById(id);
        if (existingGoalOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Goal existingGoal = existingGoalOpt.get();
        
        // Atualiza campos básicos
        existingGoal.setTitle(goal.getTitle());
        existingGoal.setGoalType(goal.getGoalType());
        existingGoal.setTargetHours(goal.getTargetHours());
        existingGoal.setStartDate(goal.getStartDate());
        existingGoal.setEndDate(goal.getEndDate());
        existingGoal.setActive(goal.isActive());
        
        // Atualiza o campo Matters (com trim para limpeza)
        if (goal.getMatters() != null) {
            existingGoal.setMatters(goal.getMatters().trim());
        } else {
            existingGoal.setMatters(null);
        }

        // Atualiza o Vínculo da Matéria
        if (goal.getSubject() != null && goal.getSubject().getId() != null){
            Optional<Subject> sub = subjectRepository.findById(goal.getSubject().getId());
            existingGoal.setSubject(sub.orElse(null));
        } else {
            existingGoal.setSubject(null);
        }

        Goal savedGoal = goalRepository.save(existingGoal);
        return ResponseEntity.ok(savedGoal);
    }

    // DELETE: Apagar meta
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}