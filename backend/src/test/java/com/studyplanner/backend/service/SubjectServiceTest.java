package com.studyplanner.backend.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class) 
class SubjectServiceTest {

    @Mock 
    private SubjectRepository subjectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks 
    private SubjectService subjectService;

    @Test
    void deveCriarMateriaComSucesso() {
        User user = new User();
        user.setId(1L);

        Subject subject = new Subject();
        subject.setName("Matemática");
        subject.setUser(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        when(subjectRepository.save(any(Subject.class))).thenReturn(subject);

        Subject criado = subjectService.createSubject(subject);

        assertNotNull(criado);
        assertEquals("Matemática", criado.getName());
        verify(subjectRepository, times(1)).save(subject); 
    }

    @Test
    void deveLancarErroSeUsuarioNaoExistir() {
        // 1. CENÁRIO
        User user = new User(); 
        user.setId(99L);

        Subject subject = new Subject();
        subject.setUser(user);

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            subjectService.createSubject(subject);
        });

        assertEquals("Usuário não encontrado.", exception.getMessage());
        
        verify(subjectRepository, never()).save(any());
    }
}