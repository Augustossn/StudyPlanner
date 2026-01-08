package com.studyplanner.backend.controller;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.service.StudySessionService;

@WebMvcTest(StudySessionController.class)
@AutoConfigureMockMvc(addFilters = false)
class StudySessionControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean
    private StudySessionService studySessionService;

    @Autowired private ObjectMapper objectMapper;

    @Test
    void deveRetornar400QuandoDataForFutura() throws Exception {
        // DADOS VÁLIDOS para passar pelo Controller e chegar no Service
        StudySession session = new StudySession();
        session.setTitle("Sessão do Futuro");
        session.setDurationMinutes(60);
        session.setDate(LocalDateTime.now().plusDays(1)); // Data futura
        
        Subject subject = new Subject(); subject.setId(1L);
        session.setSubject(subject);

        // O Mock do Service lança o erro de negócio
        when(studySessionService.createSession(any()))
            .thenThrow(new IllegalArgumentException("Não é possível registrar sessões em datas futuras."));

        mockMvc.perform(post("/api/study-sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(session)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRetornar200QuandoCriarComSucesso() throws Exception {
        // DADOS VÁLIDOS COMPLETOS
        StudySession session = new StudySession();
        session.setTitle("Estudo Válido");
        session.setDurationMinutes(45);
        session.setDate(LocalDateTime.now());
        
        Subject subject = new Subject(); subject.setId(1L);
        session.setSubject(subject);

        when(studySessionService.createSession(any())).thenReturn(session);

        mockMvc.perform(post("/api/study-sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(session)))
                .andExpect(status().isOk());
    }
}