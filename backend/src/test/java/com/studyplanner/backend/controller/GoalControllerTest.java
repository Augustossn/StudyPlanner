package com.studyplanner.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.service.GoalService;

@WebMvcTest(GoalController.class)
@AutoConfigureMockMvc(addFilters = false)
class GoalControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private GoalService goalService;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void deveListarMetasDoUsuario() throws Exception {
        Goal meta1 = new Goal(); meta1.setTitle("Meta 1");
        
        when(goalService.findGoalsByUserId(1L)).thenReturn(List.of(meta1));

        mockMvc.perform(get("/api/goals/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deveCriarMetaComSucesso() throws Exception {
        // --- CORREÇÃO: Objeto completo para passar no @Valid ---
        Goal novaMeta = new Goal();
        novaMeta.setTitle("Estudar Spring");
        novaMeta.setTargetHours(10.0);
        novaMeta.setGoalType("Semanal");
        novaMeta.setStartDate(LocalDate.now());
        
        // Simula uma matéria válida dentro da meta
        Subject subject = new Subject();
        subject.setId(1L);
        novaMeta.setSubject(subject);
        // -------------------------------------------------------

        when(goalService.createGoal(any(Goal.class))).thenReturn(novaMeta);

        mockMvc.perform(post("/api/goals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novaMeta)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Estudar Spring"));
    }

    @Test
    void deveRetornarErro400AoCriarMetaInvalida() throws Exception {
        // --- ESTRATÉGIA:
        // Queremos testar a EXCEÇÃO do Service ("Usuário não encontrado"),
        // então precisamos enviar um JSON VÁLIDO para o Controller não barrar antes.
        
        Goal metaValidadaPeloController = new Goal();
        metaValidadaPeloController.setTitle("Meta Teste");
        metaValidadaPeloController.setTargetHours(5.0);
        metaValidadaPeloController.setGoalType("Mensal");
        metaValidadaPeloController.setStartDate(LocalDate.now());
        Subject s = new Subject(); s.setId(1L);
        metaValidadaPeloController.setSubject(s);

        // Agora sim, o mock vai ser acionado e lançar o erro
        when(goalService.createGoal(any()))
            .thenThrow(new IllegalArgumentException("Usuário não encontrado"));

        mockMvc.perform(post("/api/goals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(metaValidadaPeloController)))
                .andExpect(status().isBadRequest()) 
                // O GlobalExceptionHandler retorna um JSON, não string pura.
                // Vamos apenas verificar se deu 400. Se quiser ser específico:
                // .andExpect(jsonPath("$.error").value("Usuário não encontrado"))
                ; 
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