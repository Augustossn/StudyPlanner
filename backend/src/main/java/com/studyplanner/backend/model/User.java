package com.studyplanner.backend.model;

import jakarta.persistence.*; // Se der erro, mude para javax.persistence.*
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
import java.time.LocalDateTime; 

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;

    // Relacionamentos (opcional, mas bom ter para evitar erros de mapeamento)
    @OneToMany(mappedBy = "user")
    @JsonIgnore // Evita loop infinito no JSON
    private List<Subject> subjects;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<StudySession> studySessions;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Goal> goals;

    private String recoveryCode;
    private LocalDateTime recoveryExpiration;

    // --- CONSTRUTORES ---
    public User() {}

    public User(Long id, String name, String email, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public List<Subject> getSubjects() { return subjects; }
    public void setSubjects(List<Subject> subjects) { this.subjects = subjects; }

    public List<StudySession> getStudySessions() { return studySessions; }
    public void setStudySessions(List<StudySession> studySessions) { this.studySessions = studySessions; }

    public List<Goal> getGoals() { return goals; }
    public void setGoals(List<Goal> goals) { this.goals = goals; }

    public String getRecoveryCode() { return recoveryCode; }
    public void setRecoveryCode(String recoveryCode) { this.recoveryCode = recoveryCode; }

    public LocalDateTime getRecoveryExpiration() { return recoveryExpiration; }
    public void setRecoveryExpiration(LocalDateTime recoveryExpiration) { this.recoveryExpiration = recoveryExpiration; }
}