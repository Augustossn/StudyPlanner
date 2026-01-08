package com.studyplanner.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.StudySessionRepository;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class StudySessionServiceTest {

    @Mock private StudySessionRepository studySessionRepository;
    @Mock private UserRepository userRepository;
    @Mock private SubjectRepository subjectRepository;

    @InjectMocks
    private StudySessionService studySessionService;

    @Test
    void deveCriarSessaoComSucesso() {
        User user = new User(); user.setId(1L);
        Subject subject = new Subject(); subject.setId(10L);
        
        StudySession session = new StudySession();
        session.setUser(user);
        session.setSubject(subject);
        session.setDate(LocalDateTime.now().minusHours(1)); 

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(studySessionRepository.save(any())).thenReturn(session);

        StudySession criada = studySessionService.createSession(session);

        assertNotNull(criada);
    }

    @Test
    void deveFalharAoCriarSessaoNoFuturo() {
        User user = new User(); user.setId(1L);
        Subject subject = new Subject(); subject.setId(10L);

        StudySession session = new StudySession();
        session.setUser(user);
        session.setSubject(subject);
        
        session.setDate(LocalDateTime.now().plusDays(1)); 

        IllegalArgumentException erro = assertThrows(IllegalArgumentException.class, () -> {
            studySessionService.createSession(session);
        });

        assertEquals("Não é possível registrar sessões em datas futuras.", erro.getMessage());
        
        verify(studySessionRepository, never()).save(any());
    }
}