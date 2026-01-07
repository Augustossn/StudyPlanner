package com.studyplanner.backend.service;

import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.StudySessionRepository;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    public StudySessionService(StudySessionRepository studySessionRepository, 
                               UserRepository userRepository, 
                               SubjectRepository subjectRepository) {
        this.studySessionRepository = studySessionRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    public List<StudySession> findAllByUserId(Long userId) {
        return studySessionRepository.findByUserIdOrderByDateDesc(userId);
    }

    public List<StudySession> findRecentSessions(Long userId) {
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(7).atStartOfDay();
        return studySessionRepository.findRecentSessions(userId, sevenDaysAgo);
    }

    public List<StudySession> findSessionsByRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return studySessionRepository.findSessionsByDateRange(userId, startDate, endDate);
    }
    
    public StudySession createSession(StudySession session) {
        if (session.getUser() == null || session.getSubject() == null) {
            throw new IllegalArgumentException("Usuário é obrigatório.");
        }

        if (session.getDate() != null){
            if (session.getDate().toLocalDate().isAfter(LocalDate.now())){
                throw new IllegalArgumentException("Não é possível registrar sessões em datas futuras.");
            }
        }

        User user = userRepository.findById(session.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        session.setUser(user);

        if (session.getSubject() != null && session.getSubject().getId() != null) {
            Optional<Subject> subject = subjectRepository.findById(session.getSubject().getId());
            subject.ifPresent(session::setSubject);
        }

        return studySessionRepository.save(session);
    }

    public Optional<StudySession> updateSession(Long id, StudySession sessionDetails){
        return studySessionRepository.findById(id).map(existingSession -> {
            existingSession.setTitle(sessionDetails.getTitle());
            existingSession.setDescription(sessionDetails.getDescription());
            existingSession.setDurationMinutes(sessionDetails.getDurationMinutes());
            existingSession.setDate(sessionDetails.getDate());
            existingSession.setCompleted(sessionDetails.isCompleted());
            existingSession.setMatters(sessionDetails.getMatters());

            if (sessionDetails.getSubject() != null && sessionDetails.getSubject().getId() != null) {
                existingSession.setSubject(sessionDetails.getSubject());
            }

            return studySessionRepository.save(existingSession);
        });
    }

    public void deleteSession(Long id) {
        if (studySessionRepository.existsById(id)) {
            studySessionRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Sessão não encontrada.");
        }
    }

}
