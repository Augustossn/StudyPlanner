package com.studyplanner.backend.service;

import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Habilita o Mockito
class SubjectServiceTest {

    @Mock // Cria um repositório "falso"
    private SubjectRepository subjectRepository;

    @Mock // Cria um repositório "falso"
    private UserRepository userRepository;

    @InjectMocks // Injeta os mocks acima dentro do Service real
    private SubjectService subjectService;

    @Test
    void deveCriarMateriaComSucesso() {
        // 1. CENÁRIO (Arrange)
        User user = new User();
        user.setId(1L);

        Subject subject = new Subject();
        subject.setName("Matemática");
        subject.setUser(user);

        // Quando o service buscar o usuário 1, o Mockito devolve o usuário criado acima
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        // Quando o service tentar salvar, devolve a própria matéria
        when(subjectRepository.save(any(Subject.class))).thenReturn(subject);

        // 2. AÇÃO (Act)
        Subject criado = subjectService.createSubject(subject);

        // 3. VERIFICAÇÃO (Assert)
        assertNotNull(criado);
        assertEquals("Matemática", criado.getName());
        verify(subjectRepository, times(1)).save(subject); // Garante que o save foi chamado
    }

    @Test
    void deveLancarErroSeUsuarioNaoExistir() {
        // 1. CENÁRIO
        User user = new User(); 
        user.setId(99L); // ID que não existe

        Subject subject = new Subject();
        subject.setUser(user);

        // Quando buscar o ID 99, retorna vazio (simula usuário não encontrado)
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // 2. AÇÃO E VERIFICAÇÃO
        // Esperamos que o service lance IllegalArgumentException
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            subjectService.createSubject(subject);
        });

        assertEquals("Usuário não encontrado.", exception.getMessage());
        
        // Garante que o método save NUNCA foi chamado (segurança)
        verify(subjectRepository, never()).save(any());
    }
}