package com.studyplanner.backend.controller;

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

    // --- CONSTRUTOR MANUAL (Substitui o Lombok) ---
    public StudySessionController(StudySessionRepository studySessionRepository, 
                                  UserRepository userRepository, 
                                  SubjectRepository subjectRepository) {
        this.studySessionRepository = studySessionRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudySession>> getUserSessions(@PathVariable Long userId) {
        List<StudySession> sessions = studySessionRepository.findByUserIdOrderByDateDesc(userId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<StudySession>> getRecentSessions(@PathVariable Long userId) {
        // Agora calculamos usando LocalDateTime (Data e Hora)
        // .atStartOfDay() pega o início do dia de 7 dias atrás (00:00:00)
        java.time.LocalDateTime sevenDaysAgo = java.time.LocalDate.now().minusDays(7).atStartOfDay();
        
        List<StudySession> sessions = studySessionRepository.findRecentSessions(userId, sevenDaysAgo);
        return ResponseEntity.ok(sessions);
    }

    @PostMapping
    public ResponseEntity<StudySession> createSession(@RequestBody StudySession session) {
        // Validação de segurança
        if (session.getUser() == null || session.getUser().getId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> userOptional = userRepository.findById(session.getUser().getId());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        session.setUser(userOptional.get());

        // Buscar Subject se houver
        if (session.getSubject() != null && session.getSubject().getId() != null) {
            Optional<Subject> subjectOptional = subjectRepository.findById(session.getSubject().getId());
            subjectOptional.ifPresent(session::setSubject);
        }

        StudySession savedSession = studySessionRepository.save(session);
        return ResponseEntity.ok(savedSession);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<StudySession> completeSession(@PathVariable Long id) {
        Optional<StudySession> sessionOptional = studySessionRepository.findById(id);
        if (sessionOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudySession session = sessionOptional.get();
        session.setCompleted(true);
        StudySession updatedSession = studySessionRepository.save(session);
        return ResponseEntity.ok(updatedSession);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        studySessionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}