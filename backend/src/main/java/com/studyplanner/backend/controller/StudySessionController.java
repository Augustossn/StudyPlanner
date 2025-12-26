package com.studyplanner.backend.controller;

import java.time.LocalDate;
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
import org.springframework.web.bind.annotation.RestController;

import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.StudySessionRepository;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    private final StudySessionRepository studySessionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    // construtor
    public StudySessionController(StudySessionRepository studySessionRepository, 
                                  UserRepository userRepository, 
                                  SubjectRepository subjectRepository) {
        this.studySessionRepository = studySessionRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    // get para mostrar as sessions de estudos do usuário    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudySession>> getUserSessions(@PathVariable Long userId) {
        // busca no banco de dados as sessions de estudo do usuário
        List<StudySession> sessions = studySessionRepository.findByUserIdOrderByDateDesc(userId);
        // retorna um 200 com a sessions cadastradas
        return ResponseEntity.ok(sessions);
    }

    // get para mostrar a session mais recente do usuário
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<StudySession>> getRecentSessions(@PathVariable Long userId) {
        // atribui a sevenDaysAgo os últimos 7 dias a partir de hoje
        java.time.LocalDateTime sevenDaysAgo = java.time.LocalDate.now().minusDays(7).atStartOfDay();
        
        // busca no banco de dados as sessions de estudo do usuário dos últimos 7 dias definido no sevenDaysAgo
        List<StudySession> sessions = studySessionRepository.findRecentSessions(userId, sevenDaysAgo);
        // retorn um 200 com as sessions que atendem aos requisitos
        return ResponseEntity.ok(sessions);
    }

    // post para cadastrar uma nova session
    @PostMapping
    public ResponseEntity<StudySession> createSession(@RequestBody StudySession session) {
        
        if (session.getDate() != null) {
            LocalDate sessionDate = session.getDate().toLocalDate(); // Pega apenas a data (dia/mês/ano)
            LocalDate today = LocalDate.now(); // Pega a data de hoje

            if (sessionDate.isAfter(today)) {
                // se for amanhã ou depois, retorna Erro 400 (Bad Request)
                return ResponseEntity.badRequest().build();
            }
        }

        // valida se o objeto session e seu ID foram enviados corretamente na requisição
        if (session.getUser() == null || session.getUser().getId() == null) {
            return ResponseEntity.badRequest().build();
        }

        // busca o usuário no banco pelo ID (retorna um Optional pois pode não existir)
        Optional<User> userOptional = userRepository.findById(session.getUser().getId());
        // caso não ache, retorna um 400
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        // se achou o usuário, associa e salva
        session.setUser(userOptional.get());

        // buscar Subject se houver
        if (session.getSubject() != null && session.getSubject().getId() != null) {
            Optional<Subject> subjectOptional = subjectRepository.findById(session.getSubject().getId());
            // caso haja, associa ele à session
            subjectOptional.ifPresent(session::setSubject);
        }

        // salva a session
        StudySession savedSession = studySessionRepository.save(session);
        // retorna um 200 com a session salva
        return ResponseEntity.ok(savedSession);
    }

    // put para atualizar uma session existente
    @PutMapping("/{id}/complete")
    public ResponseEntity<StudySession> completeSession(@PathVariable Long id) {
        // busca a session no banco de dados pelo id na URL
        Optional<StudySession> sessionOptional = studySessionRepository.findById(id);
        // caso seja nulo, retorna um 404
        if (sessionOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // caso não seja nulo, atualiza os valores antigos com os novos valores
        StudySession session = sessionOptional.get();
        session.setCompleted(true);

        // salva os novos valores e retorna um 200
        StudySession updatedSession = studySessionRepository.save(session);
        return ResponseEntity.ok(updatedSession);
    }

    // delete para apagar uma session existente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        // deleta do repositório pelo id e retorna um 200
        studySessionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}