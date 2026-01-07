package com.studyplanner.backend.controller;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired; // Importe
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType; // Importe
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.service.StudySessionService;

@WebMvcTest(StudySessionController.class)
@AutoConfigureMockMvc(addFilters = false) // <--- ADICIONE ISSO
class StudySessionControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean
    private StudySessionService studySessionService;

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