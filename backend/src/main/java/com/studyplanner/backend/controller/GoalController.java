package com.studyplanner.backend.controller;

import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.GoalRepository;
import com.studyplanner.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    // construtor
    public GoalController(GoalRepository goalRepository, UserRepository userRepository){
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    // get para obter os goals do usuário
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getUserGoals(@PathVariable Long userId) {
        // busca no banco todas as goals ativas do usuário
        List<Goal> goals = goalRepository.findByUser_IdAndActiveTrue(userId);
        // retorna 200 com os goals cadastrados
        return ResponseEntity.ok(goals);
    }

    // post para criar um novo goal
    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal) {
        // valida se o objeto usuário e seu ID foram enviados corretamente na requisição
        if (goal.getUser() == null || goal.getUser().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // busca o usuário no banco pelo ID (retorna um Optional pois pode não existir)
        Optional<User> userOptional = userRepository.findById(goal.getUser().getId());
        // caso não ache, retorna 400
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        // se achou o usuário, associa e salva
        goal.setUser(userOptional.get());
        Goal savedGoal = goalRepository.save(goal);
        return ResponseEntity.ok(savedGoal);
    }

    // put para atualizar uma goal existente
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goal) {
        // tenta localizar a meta no banco de dados pelo ID fornecido na URL
        Optional<Goal> existingGoal = goalRepository.findById(id);
        // caso seja nulo, retorna um 404
        if (existingGoal.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // caso seja não nulo, atualiza os valores antigos com os novos valores
        Goal updatedGoal = existingGoal.get();
        updatedGoal.setTitle(goal.getTitle());
        updatedGoal.setGoalType(goal.getGoalType());
        updatedGoal.setStartDate(goal.getStartDate());
        updatedGoal.setActive(goal.isActive());
        
        // salva os novos valores e retorna um 200
        Goal savedGoal = goalRepository.save(updatedGoal);
        return ResponseEntity.ok(savedGoal);
    }

    // delete para apagar uma goal
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        // deleta do repositório pelo id e retorna um 200
        goalRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}