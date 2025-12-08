package com.studyplanner.backend.repository;

import com.studyplanner.backend.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    List<Goal> findByUser_IdAndActiveTrue(Long userId);
    long countByUser_IdAndActiveTrue(Long userId);
}