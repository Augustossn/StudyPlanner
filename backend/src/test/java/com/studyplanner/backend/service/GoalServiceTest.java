package com.studyplanner.backend.service;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.GoalRepository;
import com.studyplanner.backend.repository.StudySessionRepository;
import com.studyplanner.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock private GoalRepository goalRepository;
    @Mock private UserRepository userRepository;
    @Mock private StudySessionRepository studySessionRepository; 

    @InjectMocks
    private GoalService goalService;

    @Test
    void deveCriarMetaComSucesso() {
        User user = new User(); user.setId(1L);
        Goal goal = new Goal();
        goal.setTitle("Aprender Java");
        goal.setUser(user);
        goal.setTargetHours(10.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(goalRepository.save(any(Goal.class))).thenReturn(goal);

        Goal criada = goalService.createGoal(goal);

        assertNotNull(criada);
        assertEquals("Aprender Java", criada.getTitle());
    }

    @Test
    void deveCalcularProgressoCorretamentePorMateria() {
        Long userId = 1L;
        Long subjectId = 5L;

        User user = new User(); user.setId(userId);
        Subject subject = new Subject(); subject.setId(subjectId);

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setSubject(subject);
        goal.setTargetHours(10.0); 
        goal.setActive(true);

        when(goalRepository.findByUser_IdAndActiveTrue(userId)).thenReturn(List.of(goal));

        when(studySessionRepository.getTotalMinutesBySubject(userId, subjectId)).thenReturn(120);

        List<Goal> metas = goalService.findGoalsByUserId(userId);

        assertFalse(metas.isEmpty());
        Goal metaProcessada = metas.get(0);

        assertEquals(2.0, metaProcessada.getCurrentHours()); 
        
        assertEquals(20, metaProcessada.getProgressPercentage());
    }

    @Test
    void deveEvitarPorcentagemMaiorQue100() {
        Long userId = 1L;
        Long subjectId = 5L;
        
        Goal goal = new Goal();
        goal.setUser(new User());
        Subject sub = new Subject(); sub.setId(subjectId);
        goal.setSubject(sub);
        goal.setTargetHours(2.0); 

        when(goalRepository.findByUser_IdAndActiveTrue(userId)).thenReturn(List.of(goal));
        when(studySessionRepository.getTotalMinutesBySubject(userId, subjectId)).thenReturn(300);

        List<Goal> metas = goalService.findGoalsByUserId(userId);

        assertEquals(100, metas.get(0).getProgressPercentage());
    }
}