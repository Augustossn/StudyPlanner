package com.studyplanner.backend.service;

import com.studyplanner.backend.dto.DashboardStatsDTO;
import com.studyplanner.backend.repository.GoalRepository;
import com.studyplanner.backend.repository.StudySessionRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime; // Alterado para LocalDateTime para bater com o Repository
import java.time.temporal.TemporalAdjusters;

@Service
public class DashboardService {

    private final StudySessionRepository studySessionRepository;
    private final GoalRepository goalRepository;

    public DashboardService(StudySessionRepository studySessionRepository, GoalRepository goalRepository){
        this.studySessionRepository = studySessionRepository;
        this.goalRepository = goalRepository;
    }

    public DashboardStatsDTO getStats(Long userId) {
        // Calcular o início da semana (segunda-feira, 00:00)
        LocalDateTime startOfWeek = LocalDateTime.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .withHour(0).withMinute(0).withSecond(0);

        // Busca os minutos (retorna 0 se não tiver nada, graças ao COALESCE no repository)
        Integer totalMinutes = studySessionRepository.getTotalStudyMinutes(userId);
        Integer weeklyMinutes = studySessionRepository.getWeeklyStudyMinutes(userId, startOfWeek);
        
        Long completedSessions = studySessionRepository.countByUser_IdAndCompletedTrue(userId);
        Long activeGoals = goalRepository.countByUser_IdAndActiveTrue(userId);

        return new DashboardStatsDTO(
            totalMinutes / 60,  
            weeklyMinutes / 60, 
            completedSessions,
            activeGoals
        );
    }
}