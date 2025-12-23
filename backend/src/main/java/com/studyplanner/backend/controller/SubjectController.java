package com.studyplanner.backend.controller;

import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    // construtor
    public SubjectController(SubjectRepository subjectRepository, UserRepository userRepository) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    // get para obter as subjects do usuário
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Subject>> getUserSubjects(@PathVariable Long userId) {
        // busca no banco de dados todos os subjects do usuário
        List<Subject> subjects = subjectRepository.findByUserId(userId);
        // retorna um 200 com os subjects cadastrado
        return ResponseEntity.ok(subjects);
    }

    // post para criar um novo subject
    @PostMapping
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        // valida se o objeto usuário e seu id foram enviados corretamente na requisição
        if (subject.getUser() == null || subject.getUser().getId() == null) {
            return ResponseEntity.badRequest().build();
        }

        // busca o usuário pelo id no banco (retorna um Optional pois pode não existir)
        Optional<User> userOptional = userRepository.findById(subject.getUser().getId());
        // caso não ache, retorna um 400
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        // se achou o usuário, associa e salva
        subject.setUser(userOptional.get());
        Subject savedSubject = subjectRepository.save(subject);
        return ResponseEntity.ok(savedSubject);
    }

    // adicionar mais tarde um método HTTP Put para atualizar os Subjects cadastrados

    // delete para apagar um subject
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        // deleta do repositório pelo id e retorna um 200
        subjectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}