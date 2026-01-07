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
import com.studyplanner.backend.model.StudySession; // Importe
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.service.StudySessionService; // Importe

@WebMvcTest(StudySessionController.class)
@AutoConfigureMockMvc(addFilters = false)
class StudySessionControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean
    private StudySessionService studySessionService;

    @Autowired private ObjectMapper objectMapper;

    @Test
    void deveRetornar400QuandoDataForFutura() throws Exception {
        // PREENCHER DADOS VÁLIDOS para passar pelo @Valid do Controller
        StudySession session = new StudySession();
        session.setTitle("Sessão Futura");
        session.setDurationMinutes(60);
        session.setDate(LocalDateTime.now().plusDays(1)); // Data futura
        
        Subject subject = new Subject(); subject.setId(1L);
        session.setSubject(subject);

        // O Service que vai reclamar da data, então precisamos chegar nele
        when(studySessionService.createSession(any()))
            .thenThrow(new IllegalArgumentException("Não é possível registrar sessões em datas futuras."));

        mockMvc.perform(post("/api/study-sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(session)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveRetornar200QuandoCriarComSucesso() throws Exception {
        // PREENCHER DADOS VÁLIDOS
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