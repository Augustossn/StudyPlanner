package com.studyplanner.backend.repository;

import com.studyplanner.backend.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // Importante
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.date >= :startDate ORDER BY s.date DESC")
    List<StudySession> findRecentSessions(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    // --- NOVOS MÉTODOS PARA O DASHBOARD ---

    // Soma total de minutos de todas as sessões do usuário
    // COALESCE(SUM(...), 0) serve para retornar 0 em vez de NULL se não houver sessões
    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudySession s WHERE s.user.id = :userId")
    Integer getTotalStudyMinutes(@Param("userId") Long userId);

    // Soma total de minutos da semana atual
    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudySession s WHERE s.user.id = :userId AND s.date >= :startDate")
    Integer getWeeklyStudyMinutes(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    // Contagem de sessões completas
    long countByUser_IdAndCompletedTrue(Long userId);
}