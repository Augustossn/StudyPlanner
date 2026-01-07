package com.studyplanner.backend.service;

import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.StudySessionRepository;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudySessionServiceTest {

    @Mock private StudySessionRepository studySessionRepository;
    @Mock private UserRepository userRepository;
    @Mock private SubjectRepository subjectRepository;

    @InjectMocks
    private StudySessionService studySessionService;

    @Test
    void deveCriarSessaoComSucesso() {
        // Cenário
        User user = new User(); user.setId(1L);
        Subject subject = new Subject(); subject.setId(10L);
        
        StudySession session = new StudySession();
        session.setUser(user);
        session.setSubject(subject);
        session.setDate(LocalDateTime.now().minusHours(1)); // Data no passado (Válida)

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(studySessionRepository.save(any())).thenReturn(session);

        // Ação
        StudySession criada = studySessionService.createSession(session);

        // Verificação
        assertNotNull(criada);
    }

    @Test
    void deveFalharAoCriarSessaoNoFuturo() {
        // Cenário
        User user = new User(); user.setId(1L);
        Subject subject = new Subject(); subject.setId(10L);

        StudySession session = new StudySession();
        session.setUser(user);
        session.setSubject(subject);
        
        // DATA NO FUTURO (Inválida)
        session.setDate(LocalDateTime.now().plusDays(1)); 

        // Ação e Verificação
        IllegalArgumentException erro = assertThrows(IllegalArgumentException.class, () -> {
            studySessionService.createSession(session);
        });

        assertEquals("Não é possível registrar sessões em datas futuras.", erro.getMessage());
        
        // Garante que nada foi salvo
        verify(studySessionRepository, never()).save(any());
    }
}