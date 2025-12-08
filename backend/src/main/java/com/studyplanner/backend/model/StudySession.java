package com.studyplanner.backend.model;

import javax.persistence.*; // Se der erro, mude para javax.persistence.*
import java.time.LocalDateTime; // Ou LocalDate, dependendo do seu uso

@Entity
@Table(name = "study_sessions")
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDateTime date; // Data da sessão
    private int durationMinutes;
    private boolean completed;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    // --- CONSTRUTORES ---
    public StudySession() {}

    public StudySession(Long id, String title, LocalDateTime date, int durationMinutes, boolean completed, User user, Subject subject) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.durationMinutes = durationMinutes;
        this.completed = completed;
        this.user = user;
        this.subject = subject;
    }

    // --- GETTERS E SETTERS MANUAIS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

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
}