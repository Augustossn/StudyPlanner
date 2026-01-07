package com.studyplanner.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.service.SubjectService;
import com.studyplanner.backend.repository.UserRepository; // Importe o repositório

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc; // Importante
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SubjectController.class)
@AutoConfigureMockMvc(addFilters = false) // <--- ESSENCIAL: Desliga a segurança nos testes
class SubjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SubjectService subjectService;

    // Às vezes o contexto do Spring tenta carregar Beans relacionados a User
    // Adicionar este MockBean previne erros de "Bean not found"
    @MockBean
    private UserRepository userRepository; 

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void deveListarMateriasDoUsuario() throws Exception {
        Subject mat1 = new Subject(); mat1.setName("Java");
        Subject mat2 = new Subject(); mat2.setName("React");
        
        when(subjectService.findSubjectsByUserId(1L)).thenReturn(List.of(mat1, mat2));

        mockMvc.perform(get("/api/subjects/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Java"));
    }

    @Test
    void deveCriarMateriaComSucesso() throws Exception {
        Subject novaMateria = new Subject();
        novaMateria.setName("Spring Boot");
        User user = new User(); user.setId(1L);
        novaMateria.setUser(user);

        when(subjectService.createSubject(any(Subject.class))).thenReturn(novaMateria);

        mockMvc.perform(post("/api/subjects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novaMateria)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Spring Boot"));
    }

    @Test
    void deveRetornarErro400SeServiceFalhar() throws Exception {
        Subject materiaInvalida = new Subject();
        
        when(subjectService.createSubject(any()))
            .thenThrow(new IllegalArgumentException("Usuário inválido"));

        mockMvc.perform(post("/api/subjects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(materiaInvalida)))
                .andExpect(status().isBadRequest()); // Espera 400
    }
}