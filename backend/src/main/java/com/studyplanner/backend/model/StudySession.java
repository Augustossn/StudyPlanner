package com.studyplanner.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "study_sessions")
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    // Adicionei este campo pois seu Frontend envia "description"
    @Column(columnDefinition = "TEXT") // Permite textos longos
    private String description; 

    private LocalDateTime date;
    private int durationMinutes;
    private boolean completed;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    // Lista de assuntos estudadas NESTA sessão (ex: "Geometria")
    @ElementCollection(fetch = FetchType.EAGER) 
    @CollectionTable(name = "session_subtopics", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "name")
    private List<String> subSubjects = new ArrayList<>();
    
    // --- CONSTRUTORES ---
    public StudySession() {}

    public StudySession(Long id, String title, String description, LocalDateTime date, int durationMinutes, boolean completed, User user, Subject subject, List<String> subSubjects) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.durationMinutes = durationMinutes;
        this.completed = completed;
        this.user = user;
        this.subject = subject;
        this.subSubjects = subSubjects;
    }

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    // Faltava adicionar estes dois abaixo:
    public List<String> getSubSubjects() { return subSubjects; }
    public void setSubSubjects(List<String> subSubjects) { this.subSubjects = subSubjects; }
}