package com.studyplanner.backend.controller;

import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.GoalRepository;
import com.studyplanner.backend.repository.StudySessionRepository; // <--- NOVO IMPORT
import com.studyplanner.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime; // <--- NOVO IMPORT
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final StudySessionRepository sessionRepository; // <--- INJEÇÃO DO REPOSITÓRIO DE SESSÕES

    // Construtor atualizado recebendo o sessionRepository
    public GoalController(GoalRepository goalRepository, UserRepository userRepository, StudySessionRepository sessionRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
    }

    // GET: Obter goals do usuário COM CÁLCULO DE PROGRESSO
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getUserGoals(@PathVariable Long userId) {
        // 1. Busca as metas ativas
        List<Goal> goals = goalRepository.findByUser_IdAndActiveTrue(userId);

        // 2. Loop para calcular o progresso de cada uma
        for (Goal goal : goals) {
            if (goal.getStartDate() != null) {
                // Define o início (00:00 do dia de início)
                LocalDateTime start = goal.getStartDate().atStartOfDay();
                
                // Define o fim (23:59 da data fim, ou AGORA se não tiver data fim)
                LocalDateTime end = (goal.getEndDate() != null) 
                        ? goal.getEndDate().atTime(23, 59, 59) 
                        : LocalDateTime.now();

                // 3. Busca a soma dos minutos no banco (usando o método que criamos no Repository)
                Integer totalMinutes = sessionRepository.getTotalMinutesByDateRange(userId, start, end);
                
                // Trata nulo (caso não tenha nenhuma sessão)
                if (totalMinutes == null) {
                    totalMinutes = 0;
                }

                // 4. Converte para horas (ex: 90min -> 1.5h)
                double hoursDone = totalMinutes / 60.0;
                
                // Arredonda para 1 casa decimal para ficar bonito no front
                goal.setCurrentHours(Math.round(hoursDone * 10.0) / 10.0);

                // 5. Calcula porcentagem (0 a 100%)
                if (goal.getTargetHours() > 0) {
                    int percent = (int) ((hoursDone / goal.getTargetHours()) * 100);
                    // Garante que não passe de 100% visualmente
                    goal.setProgressPercentage(Math.min(percent, 100));
                } else {
                    goal.setProgressPercentage(0);
                }
            }
        }

        return ResponseEntity.ok(goals);
    }

    // POST: Criar novo goal
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
        Goal savedGoal = goalRepository.save(goal);
        return ResponseEntity.ok(savedGoal);
    }

    // PUT: Atualizar goal
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goal) {
        Optional<Goal> existingGoal = goalRepository.findById(id);
        if (existingGoal.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Goal updatedGoal = existingGoal.get();
        updatedGoal.setTitle(goal.getTitle());
        updatedGoal.setGoalType(goal.getGoalType());
        updatedGoal.setTargetHours(goal.getTargetHours()); // Garanta que está atualizando as horas alvo também
        updatedGoal.setStartDate(goal.getStartDate());
        updatedGoal.setEndDate(goal.getEndDate()); // Atualiza data fim se houver
        updatedGoal.setActive(goal.isActive());
        
        Goal savedGoal = goalRepository.save(updatedGoal);
        return ResponseEntity.ok(savedGoal);
    }

    // DELETE: Apagar goal
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}