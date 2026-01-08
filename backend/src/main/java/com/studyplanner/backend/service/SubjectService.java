package com.studyplanner.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public SubjectService(SubjectRepository subjectRepository, UserRepository userRepository) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    public List<Subject> findSubjectsByUserId(Long userId) {
        return subjectRepository.findByUserId(userId);
    }

    public Subject createSubject(Subject subject) {
        if (subject.getUser() == null || subject.getUser().getId() == null) {
            throw new IllegalArgumentException("ID do usuário é obrigatório.");
        }

        User user = userRepository.findById(subject.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        subject.setUser(user);
        
        if (subject.getMatters() == null) {
            subject.setMatters(List.of());
        }

        return subjectRepository.save(subject);
    }

    public Optional<Subject> updateSubject(Long id, Subject subjectData) {
        return subjectRepository.findById(id).map(existingSubject -> {
            existingSubject.setName(subjectData.getName());
            existingSubject.setColor(subjectData.getColor());
            
            if (subjectData.getMatters() != null) {
                existingSubject.setMatters(subjectData.getMatters());
            }
            
            return subjectRepository.save(existingSubject);
        });
    }

    public void deleteSubject(Long id) {
        if (subjectRepository.existsById(id)) {
            subjectRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Matéria não encontrada para exclusão.");
        }
    }
}