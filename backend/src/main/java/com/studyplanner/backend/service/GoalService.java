package com.studyplanner.backend.service;

import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.GoalRepository;
import com.studyplanner.backend.repository.StudySessionRepository;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudySessionRepository studySessionRepository;

    public GoalService(GoalRepository goalRepository, 
                       UserRepository userRepository, 
                       SubjectRepository subjectRepository, 
                       StudySessionRepository studySessionRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.studySessionRepository = studySessionRepository;
    }

    public List<Goal> findGoalsByUserId(Long userId) {
        List<Goal> goals = goalRepository.findByUser_IdAndActiveTrue(userId);

        for (Goal goal : goals) {
            Integer totalMinutes = 0;
            Integer totalQuestions = 0;

            LocalDateTime start = (goal.getStartDate() != null) ? goal.getStartDate().atStartOfDay() : null;
            
            LocalDateTime safeMaxDate = LocalDateTime.of(2999, 12, 31, 23, 59, 59);

            LocalDateTime end = (goal.getEndDate() != null) 
                    ? goal.getEndDate().atTime(23, 59, 59) 
                    : safeMaxDate; 

            if (goal.getSubject() != null && goal.getMatters() != null && !goal.getMatters().trim().isEmpty()) {
                totalMinutes = studySessionRepository.getTotalMinutesByMatter(userId, goal.getSubject().getId(), goal.getMatters().trim());
                totalQuestions = studySessionRepository.getTotalQuestionsByMatter(userId, goal.getSubject().getId(), goal.getMatters().trim());
            }
            else if (goal.getSubject() != null) {
                totalMinutes = studySessionRepository.getTotalMinutesBySubject(userId, goal.getSubject().getId());
                totalQuestions = studySessionRepository.getTotalQuestionsBySubject(userId, goal.getSubject().getId());
            }
            else if (start != null) {
                totalMinutes = studySessionRepository.getTotalMinutesByDateRange(userId, start, end);
                totalQuestions = studySessionRepository.getTotalQuestionsByDateRange(userId, start, end);
            }

            if (totalMinutes == null) totalMinutes = 0;
            if (totalQuestions == null) totalQuestions = 0;

            double hoursDone = totalMinutes / 60.0;
            goal.setCurrentHours(Math.round(hoursDone * 10.0) / 10.0);
            goal.setCurrentQuestions(totalQuestions);

            int percent = 0;
            if (goal.getTargetHours() != null && goal.getTargetHours() > 0) {
                percent = (int) ((hoursDone / goal.getTargetHours()) * 100);
            } else if (goal.getTargetQuestions() != null && goal.getTargetQuestions() > 0) {
                percent = (int) (((double) totalQuestions / goal.getTargetQuestions()) * 100);
            }
            goal.setProgressPercentage(Math.min(percent, 100));
        }
        return goals;
    }

    public Goal createGoal(Goal goal){
        if (goal.getUser() == null || goal.getUser().getId() == null) {
            throw new IllegalArgumentException("ID do usuário é obrigatório");
        }

        Optional<User> userOptional = userRepository.findById(goal.getUser().getId());
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        goal.setUser(userOptional.get());

        if (goal.getSubject() != null && goal.getSubject().getId() != null) {
            Optional<Subject> sub = subjectRepository.findById(goal.getSubject().getId());
            goal.setSubject(sub.orElse(null));
        } else {
            goal.setSubject(null);
        }

        if (goal.getMatters() != null) {
            goal.setMatters(goal.getMatters().trim());
        } 

        return goalRepository.save(goal);
    }

    public Optional<Goal> updateGoal(Long id, Goal goal){
        return goalRepository.findById(id).map(existingGoal -> {
            existingGoal.setTitle(goal.getTitle());
            existingGoal.setGoalType(goal.getGoalType());
            existingGoal.setTargetHours(goal.getTargetHours());
            
            // --- NOVO: ATUALIZAR QUESTÕES ALVO ---
            existingGoal.setTargetQuestions(goal.getTargetQuestions());

            existingGoal.setStartDate(goal.getStartDate());
            existingGoal.setEndDate(goal.getEndDate());
            existingGoal.setActive(goal.isActive());

            if (goal.getMatters() != null) {
                existingGoal.setMatters(goal.getMatters().trim());
            } else {
                existingGoal.setMatters(null);
            }

            if (goal.getSubject() != null && goal.getSubject().getId() != null) {
                Optional<Subject> sub = subjectRepository.findById(goal.getSubject().getId());
                existingGoal.setSubject(sub.orElse(null));
            } else {
                existingGoal.setSubject(null);
            }

            return goalRepository.save(existingGoal); 
        });
    }

    public void deleteGoal(Long id){
        if (goalRepository.existsById(id)) {
            goalRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Meta não encontrada.");
        }
    }
}