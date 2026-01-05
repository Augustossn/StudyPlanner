package com.studyplanner.backend.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.StudySessionRepository;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    private final StudySessionRepository studySessionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    public StudySessionController(StudySessionRepository studySessionRepository, 
                                  UserRepository userRepository, 
                                  SubjectRepository subjectRepository) {
        this.studySessionRepository = studySessionRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    // GET: Mostrar histórico completo
    @Operation(summary = "Listar histórico de sessões", description = "Retorna a lista completa de todas as sessões de estudo de um usuário, ordenadas da mais recente para a mais antiga.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudySession>> getUserSessions(@PathVariable Long userId) {
        List<StudySession> sessions = studySessionRepository.findByUserIdOrderByDateDesc(userId);
        return ResponseEntity.ok(sessions);
    }

    // GET: Mostrar sessões recentes (Gráficos)
    @Operation(summary = "Listar sessões recentes (7 dias)", description = "Retorna apenas as sessões realizadas nos últimos 7 dias. Utilizado para alimentar gráficos de desempenho semanal.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista recente retornada com sucesso")
    })
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<StudySession>> getRecentSessions(@PathVariable Long userId) {
        java.time.LocalDateTime sevenDaysAgo = java.time.LocalDate.now().minusDays(7).atStartOfDay();
        List<StudySession> sessions = studySessionRepository.findRecentSessions(userId, sevenDaysAgo);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<StudySession>> getSessionsByRange(
            @PathVariable Long userId,
            @RequestParam("start") String startStr, // Vem como "2026-01-01T00:00:00"
            @RequestParam("end") String endStr) {
        
        LocalDateTime start = LocalDateTime.parse(startStr);
        LocalDateTime end = LocalDateTime.parse(endStr);
        
        return ResponseEntity.ok(studySessionRepository.findSessionsByDateRange(userId, start, end));
    }

    // POST: Cadastrar sessão
    @Operation(summary = "Registrar nova sessão", description = "Cria um novo registro de estudo. Valida se o usuário existe e bloqueia o cadastro de datas futuras.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sessão registrada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Data futura inválida ou Usuário não encontrado")
    })
    @PostMapping
    public ResponseEntity<StudySession> createSession(@RequestBody StudySession session) {
        
        // Validação de data futura
        if (session.getDate() != null) {
            LocalDate sessionDate = session.getDate().toLocalDate();
            LocalDate today = LocalDate.now();

            if (sessionDate.isAfter(today)) {
                return ResponseEntity.badRequest().build();
            }
        }

        if (session.getUser() == null || session.getUser().getId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> userOptional = userRepository.findById(session.getUser().getId());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        session.setUser(userOptional.get());

        if (session.getSubject() != null && session.getSubject().getId() != null) {
            Optional<Subject> subjectOptional = subjectRepository.findById(session.getSubject().getId());
            subjectOptional.ifPresent(session::setSubject);
        }

        StudySession savedSession = studySessionRepository.save(session);
        return ResponseEntity.ok(savedSession);
    }

    // PUT: Atualizar sessão
    @Operation(summary = "Atualizar sessão existente", description = "Permite editar os detalhes de uma sessão (título, descrição, matéria, conclusão) pelo ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sessão atualizada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Sessão não encontrada para o ID informado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<StudySession> updateSession(@PathVariable Long id, @RequestBody StudySession sessionDetails) {
        Optional<StudySession> optionalSession = studySessionRepository.findById(id);
        
        if (optionalSession.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudySession existingSession = optionalSession.get();
        
        existingSession.setTitle(sessionDetails.getTitle());
        existingSession.setDescription(sessionDetails.getDescription());
        existingSession.setDurationMinutes(sessionDetails.getDurationMinutes());
        existingSession.setDate(sessionDetails.getDate());
        existingSession.setCompleted(sessionDetails.isCompleted());
        existingSession.setMatters(sessionDetails.getMatters());

        if (sessionDetails.getSubject() != null && sessionDetails.getSubject().getId() != null) {
            existingSession.setSubject(sessionDetails.getSubject());
        }

        StudySession updatedSession = studySessionRepository.save(existingSession);
        return ResponseEntity.ok(updatedSession);
    }

    // DELETE: Apagar sessão
    @Operation(summary = "Excluir sessão", description = "Remove permanentemente um registro de estudo do banco de dados.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sessão excluída com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        studySessionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}