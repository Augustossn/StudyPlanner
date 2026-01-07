package com.studyplanner.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.service.StudySessionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    private final StudySessionService studySessionService;

    public StudySessionController(StudySessionService studySessionService) {
        this.studySessionService = studySessionService;
    }

    // GET: Mostrar histórico completo
    @Operation(summary = "Listar histórico de sessões", description = "Retorna a lista completa de todas as sessões de estudo de um usuário, ordenadas da mais recente para a mais antiga.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudySession>> getUserSessions(@PathVariable Long userId) {
        List<StudySession> sessions = studySessionService.findAllByUserId(userId);
        return ResponseEntity.ok(sessions);
    }

    // GET: Mostrar sessões recentes (Gráficos)
    @Operation(summary = "Listar sessões recentes (7 dias)", description = "Retorna apenas as sessões realizadas nos últimos 7 dias. Utilizado para alimentar gráficos de desempenho semanal.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista recente retornada com sucesso")
    })
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<StudySession>> getRecentSessions(@PathVariable Long userId) {
        List<StudySession> sessions = studySessionService.findRecentSessions(userId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<StudySession>> getSessionsByRange(
            @PathVariable Long userId,
            @RequestParam("start") String startStr, 
            @RequestParam("end") String endStr) {
        
        LocalDateTime start = LocalDateTime.parse(startStr);
        LocalDateTime end = LocalDateTime.parse(endStr);

        return ResponseEntity.ok(studySessionService.findSessionsByRange(userId, start, end));
    }

    // POST: Cadastrar sessão
    @Operation(summary = "Registrar nova sessão", description = "Cria um novo registro de estudo. Valida se o usuário existe e bloqueia o cadastro de datas futuras.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sessão registrada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Data futura inválida ou Usuário não encontrado")
    })
    @PostMapping
    public ResponseEntity<StudySession> createSession(@Valid @RequestBody StudySession session) {
        try {
            StudySession createdSession = studySessionService.createSession(session);
            return ResponseEntity.ok(createdSession);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT: Atualizar sessão
    @Operation(summary = "Atualizar sessão existente", description = "Permite editar os detalhes de uma sessão (título, descrição, matéria, conclusão) pelo ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sessão atualizada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Sessão não encontrada para o ID informado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<StudySession> updateSession(@PathVariable Long id, @RequestBody StudySession sessionDetails) {
        return studySessionService.updateSession(id, sessionDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE: Apagar sessão
    @Operation(summary = "Excluir sessão", description = "Remove permanentemente um registro de estudo do banco de dados.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sessão excluída com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        try {
            studySessionService.deleteSession(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}