package com.studyplanner.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.service.GoalService;
import com.studyplanner.backend.repository.UserRepository; // Importe para evitar erros de contexto

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GoalController.class)
@AutoConfigureMockMvc(addFilters = false) // Ignora a segurança (Login) nos testes
class GoalControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private GoalService goalService;
    @MockBean private UserRepository userRepository; // Previne erros de contexto do Spring
    @Autowired private ObjectMapper objectMapper;

    @Test
    void deveListarMetasDoUsuario() throws Exception {
        // Cenário
        Goal meta1 = new Goal(); meta1.setTitle("Meta 1");
        Goal meta2 = new Goal(); meta2.setTitle("Meta 2");
        
        when(goalService.findGoalsByUserId(1L)).thenReturn(List.of(meta1, meta2));

        // Ação e Verificação (GET)
        mockMvc.perform(get("/api/goals/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Meta 1"));
    }

    @Test
    void deveCriarMetaComSucesso() throws Exception {
        // Cenário
        Goal novaMeta = new Goal();
        novaMeta.setTitle("Estudar Spring");
        novaMeta.setTargetHours(10.0);

        when(goalService.createGoal(any(Goal.class))).thenReturn(novaMeta);

        // Ação (POST)
        mockMvc.perform(post("/api/goals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novaMeta)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Estudar Spring"));
    }

    @Test
    void deveRetornarErro400AoCriarMetaInvalida() throws Exception {
        // Cenário: Service reclama de usuário inexistente
        Goal metaInvalida = new Goal();
        
        when(goalService.createGoal(any()))
            .thenThrow(new IllegalArgumentException("Usuário não encontrado"));

        // Ação e Verificação
        mockMvc.perform(post("/api/goals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(metaInvalida)))
                .andExpect(status().isBadRequest()) // 400
                .andExpect(content().string("Usuário não encontrado")); // Verifica a mensagem
    }

    @Test
    void deveAtualizarMetaComSucesso() throws Exception {
        // Cenário
        Goal metaAtualizada = new Goal();
        metaAtualizada.setTitle("Título Novo");

        // O Service retorna um Optional contendo a meta atualizada
        when(goalService.updateGoal(eq(1L), any(Goal.class)))
            .thenReturn(Optional.of(metaAtualizada));

        // Ação (PUT)
        mockMvc.perform(put("/api/goals/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(metaAtualizada)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Título Novo"));
    }

    @Test
    void deveRetornar404AoTentarAtualizarMetaInexistente() throws Exception {
        // Cenário: Service retorna Optional vazio (não achou)
        when(goalService.updateGoal(eq(99L), any(Goal.class)))
            .thenReturn(Optional.empty());

        Goal metaDados = new Goal();
        metaDados.setTitle("Tanto faz");

        // Ação e Verificação
        mockMvc.perform(put("/api/goals/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(metaDados)))
                .andExpect(status().isNotFound()); // 404
    }

    @Test
    void deveDeletarMetaComSucesso() throws Exception {
        // Ação (DELETE) - Mockito por padrão não faz nada em métodos void, o que simula sucesso
        mockMvc.perform(delete("/api/goals/1"))
                .andExpect(status().isOk());
    }

    @Test
    void deveRetornar404AoTentarDeletarMetaInexistente() throws Exception {
        // Cenário: Service lança exceção ao tentar deletar
        doThrow(new IllegalArgumentException("Meta não encontrada."))
            .when(goalService).deleteGoal(99L);

        // Ação e Verificação
        mockMvc.perform(delete("/api/goals/99"))
                .andExpect(status().isNotFound()); // 404
    }
}