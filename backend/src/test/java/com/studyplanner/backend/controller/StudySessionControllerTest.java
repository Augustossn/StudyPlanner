package com.studyplanner.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.service.StudySessionService;
import com.studyplanner.backend.repository.UserRepository; // Importe

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc; // Importe
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StudySessionController.class)
@AutoConfigureMockMvc(addFilters = false) // <--- ADICIONE ISSO
class StudySessionControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private StudySessionService studySessionService;
    
    // Adicione mocks extras para evitar erros de contexto
    @MockBean private UserRepository userRepository;

    @Autowired private ObjectMapper objectMapper;

    @Test
    void deveRetornar400QuandoDataForFutura() throws Exception {
        StudySession session = new StudySession();
        
        when(studySessionService.createSession(any()))
            .thenThrow(new IllegalArgumentException("Não é possível registrar sessões em datas futuras."));

        mockMvc.perform(post("/api/study-sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(session)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRetornar200QuandoCriarComSucesso() throws Exception {
        StudySession session = new StudySession();
        session.setTitle("Estudo Válido");

        when(studySessionService.createSession(any())).thenReturn(session);

        mockMvc.perform(post("/api/study-sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(session)))
                .andExpect(status().isOk());
    }
}