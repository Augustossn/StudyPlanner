package com.studyplanner.backend.service;

import com.studyplanner.backend.dto.DashboardStatsDTO;
import com.studyplanner.backend.dto.DashboardStatsDTO.ChartDataDTO;
import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.repository.GoalRepository;
import com.studyplanner.backend.repository.StudySessionRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final StudySessionRepository studySessionRepository;
    private final GoalRepository goalRepository;

    public DashboardService(StudySessionRepository studySessionRepository, GoalRepository goalRepository){
        this.studySessionRepository = studySessionRepository;
        this.goalRepository = goalRepository;
    }

    public DashboardStatsDTO getStats(Long userId) {
        ZoneId brazilZone = ZoneId.of("America/Sao_Paulo");
        LocalDateTime now = LocalDateTime.now(brazilZone);
        
        LocalDateTime startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .withHour(0).withMinute(0).withSecond(0);

        LocalDateTime sevenDaysAgo = now.minusDays(6).withHour(0).withMinute(0).withSecond(0); // Calcula os últimos 7 dias, mudar isso depois para conseguir ver mais tempo para trás
        List<StudySession> sessions = studySessionRepository.findByUserIdAndDateAfter(userId, sevenDaysAgo);

        Map<LocalDate, Double> dailyMap = sessions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getDate().toLocalDate(), // LocalDate para agrupar 
                        Collectors.summingDouble(s -> s.getDurationMinutes() / 60.0) // Somatório das horas
                ));

        List<ChartDataDTO> chartData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 0; i < 7; i++) {
            LocalDate date = sevenDaysAgo.plusDays(i).toLocalDate();
            Double hours = dailyMap.getOrDefault(date, 0.0);
            chartData.add(new ChartDataDTO(date.format(formatter), hours));
        }

        Integer totalMinutes = studySessionRepository.getTotalStudyMinutes(userId);
        Integer weeklyMinutes = studySessionRepository.getWeeklyStudyMinutes(userId, startOfWeek);
        Long completedSessions = studySessionRepository.countByUser_IdAndCompletedTrue(userId);
        Long activeGoals = goalRepository.countByUser_IdAndActiveTrue(userId);

        return new DashboardStatsDTO(
            totalMinutes != null ? totalMinutes / 60 : 0,  
            weeklyMinutes != null ? weeklyMinutes / 60 : 0, 
            completedSessions,
            activeGoals,
            chartData 
        );
    }
}