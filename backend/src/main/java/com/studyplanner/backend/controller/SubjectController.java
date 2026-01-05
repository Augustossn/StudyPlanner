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

import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import com.studyplanner.backend.repository.SubjectRepository;
import com.studyplanner.backend.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public SubjectController(SubjectRepository subjectRepository, UserRepository userRepository) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    // GET: Listar matérias
    @Operation(summary = "Listar matérias do usuário", description = "Retorna todas as matérias cadastradas para um usuário específico, incluindo suas cores e seus assuntos.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de matérias retornada com sucesso")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Subject>> getUserSubjects(@PathVariable Long userId) {
        List<Subject> subjects = subjectRepository.findByUserId(userId);
        return ResponseEntity.ok(subjects);
    }

    // POST: Criar matéria
    @Operation(summary = "Cadastrar nova matéria", description = "Cria uma nova disciplina de estudo (ex: Matemática, História) vinculada a um usuário.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Matéria criada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Usuário não informado ou não encontrado")
    })
    @PostMapping
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        // Validação unificada
        if (subject.getUser() == null || subject.getUser().getId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> userOptional = userRepository.findById(subject.getUser().getId());
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        subject.setUser(userOptional.get());
        Subject savedSubject = subjectRepository.save(subject);
        return ResponseEntity.ok(savedSubject);
    }

    // PUT: Atualizar matéria
    @Operation(summary = "Atualizar matéria", description = "Permite alterar o nome, a cor de identificação e a lista de assuntos (tags) de uma disciplina.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Matéria atualizada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Matéria não encontrada para o ID informado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subject){
        Optional<Subject> existingSubject = subjectRepository.findById(id);
        
        if (existingSubject.isEmpty()){
            return ResponseEntity.notFound().build();
        }

        Subject updatedSubject = existingSubject.get();
        updatedSubject.setName(subject.getName());
        updatedSubject.setColor(subject.getColor());
        updatedSubject.setMatters(subject.getMatters());

        Subject savedSubject = subjectRepository.save(updatedSubject);
        return ResponseEntity.ok(savedSubject);
    }

    // DELETE: Apagar matéria
    @Operation(summary = "Excluir matéria", description = "Remove uma matéria do banco de dados. CUIDADO: Isso pode afetar sessões de estudo vinculadas a ela.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Matéria excluída com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        subjectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}