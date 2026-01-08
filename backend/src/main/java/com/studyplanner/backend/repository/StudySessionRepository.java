package com.studyplanner.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; 
import org.springframework.stereotype.Repository;

import com.studyplanner.backend.model.StudySession;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.date >= :startDate ORDER BY s.date DESC")
    List<StudySession> findRecentSessions(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudySession s WHERE s.user.id = :userId") // Soma total dos min para todos os users
    Integer getTotalStudyMinutes(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudySession s WHERE s.user.id = :userId AND s.date >= :startDate") // Soma total min semana atual
    Integer getWeeklyStudyMinutes(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudySession s WHERE s.user.id = :userId AND s.date >= :startDate AND s.date <= :endDate")
    Integer getTotalMinutesByDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudySession s WHERE s.user.id = :userId AND s.subject.id = :subjectId")
    Integer getTotalMinutesBySubject(@Param("userId") Long userId, @Param("subjectId") Long subjectId);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM StudySession s JOIN s.matters matter WHERE s.user.id = :userId AND s.subject.id = :subjectId AND matter = :matter")
    Integer getTotalMinutesByMatter(@Param("userId") Long userId, @Param("subjectId") Long subjectId, @Param("matter") String matter);

    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.date >= :startDate AND s.date <= :endDate ORDER BY s.date ASC")
    List<StudySession> findSessionsByDateRange(
        @Param("userId") Long userId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );

    long countByUser_IdAndCompletedTrue(Long userId); 

    List<StudySession> findByUserIdAndDateAfter(Long userId, LocalDateTime date);
}