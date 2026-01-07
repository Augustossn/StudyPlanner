package com.studyplanner.backend.service;

import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.GoalRepository;
import com.studyplanner.backend.repository.StudySessionRepository;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock private GoalRepository goalRepository;
    @Mock private UserRepository userRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private StudySessionRepository studySessionRepository; // Importante para o cálculo de horas

    @InjectMocks
    private GoalService goalService;

    @Test
    void deveCriarMetaComSucesso() {
        // Cenário
        User user = new User(); user.setId(1L);
        Goal goal = new Goal();
        goal.setTitle("Aprender Java");
        goal.setUser(user);
        goal.setTargetHours(10.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(goalRepository.save(any(Goal.class))).thenReturn(goal);

        // Ação
        Goal criada = goalService.createGoal(goal);

        // Verificação
        assertNotNull(criada);
        assertEquals("Aprender Java", criada.getTitle());
    }

    @Test
    void deveCalcularProgressoCorretamentePorMateria() {
        // CENÁRIO:
        // Meta: Estudar 10 horas de Matemática
        // O usuário já estudou: 120 minutos (2 horas)
        // Resultado esperado: 20% de progresso

        Long userId = 1L;
        Long subjectId = 5L;

        User user = new User(); user.setId(userId);
        Subject subject = new Subject(); subject.setId(subjectId);

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setSubject(subject);
        goal.setTargetHours(10.0); // Meta de 10 horas
        goal.setActive(true);

        // Mock do Banco de Dados
        // 1. O repositório de metas retorna essa meta
        when(goalRepository.findByUser_IdAndActiveTrue(userId)).thenReturn(List.of(goal));

        // 2. O repositório de sessões diz que foram estudados 120 minutos dessa matéria
        when(studySessionRepository.getTotalMinutesBySubject(userId, subjectId)).thenReturn(120);

        // AÇÃO
        List<Goal> metas = goalService.findGoalsByUserId(userId);

        // VERIFICAÇÃO
        assertFalse(metas.isEmpty());
        Goal metaProcessada = metas.get(0);

        // 120 min = 2 horas.
        assertEquals(2.0, metaProcessada.getCurrentHours()); 
        
        // 2 horas de 10 horas = 20%
        assertEquals(20, metaProcessada.getProgressPercentage());
    }

    @Test
    void deveEvitarPorcentagemMaiorQue100() {
        // CENÁRIO: Meta de 2 horas, mas estudou 5 horas. Deve cravar em 100%.
        Long userId = 1L;
        Long subjectId = 5L;
        
        Goal goal = new Goal();
        goal.setUser(new User());
        Subject sub = new Subject(); sub.setId(subjectId);
        goal.setSubject(sub);
        goal.setTargetHours(2.0); // Meta pequena

        when(goalRepository.findByUser_IdAndActiveTrue(userId)).thenReturn(List.of(goal));
        // Estudou 300 minutos (5 horas)
        when(studySessionRepository.getTotalMinutesBySubject(userId, subjectId)).thenReturn(300);

        // Ação
        List<Goal> metas = goalService.findGoalsByUserId(userId);

        // Verificação
        assertEquals(100, metas.get(0).getProgressPercentage()); // Não pode ser 250%
    }
}