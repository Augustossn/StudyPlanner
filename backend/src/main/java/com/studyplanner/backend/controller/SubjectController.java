package com.studyplanner.backend.controller;

import java.util.List;

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
import com.studyplanner.backend.service.SubjectService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @Operation(summary = "Listar matérias do usuário", description = "Retorna a lista completa de todas as matérias associadas a um usuário.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Matérias listadas com sucesso")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Subject>> getUserSubjects(@PathVariable Long userId) {
        List<Subject> subjects = subjectService.findSubjectsByUserId(userId);
        return ResponseEntity.ok(subjects);
    }

    @Operation(summary = "Cadastrar nova matéria", description = "Cria uma nova matéria associada a um usuário. Valida se o usuário existe.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Matéria cadastrada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Erro de validação")
    })
    @PostMapping
    public ResponseEntity<?> createSubject(@Valid @RequestBody Subject subject) {
        try {
            Subject savedSubject = subjectService.createSubject(subject);
            return ResponseEntity.ok(savedSubject);
        } catch (IllegalArgumentException e) {
            // Se o Service reclamar (usuário não existe, etc), devolvemos 400 Bad Request
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Atualizar matéria")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Matéria atualizada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Matéria não encontrada para o ID informado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        return subjectService.updateSubject(id, subject)
                .map(ResponseEntity::ok) // Se achou e atualizou, devolve 200 OK
                .orElse(ResponseEntity.notFound().build()); // Se não achou (Optional vazio), devolve 404
    }

    @Operation(summary = "Excluir matéria")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Matéria excluída com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}