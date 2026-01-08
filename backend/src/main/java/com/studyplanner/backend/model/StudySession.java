package com.studyplanner.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import jakarta.validation.constraints.*;

@Entity
@Table(name = "study_sessions")
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O título da sessão é obrigatório")
    @Size(max = 100, message = "O título deve ter no máximo 100 caracteres")
    private String title;
    
    @Column(columnDefinition = "TEXT")
    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
    private String description; 

    @NotNull(message = "A data e hora da sessão são obrigatórias")
    private LocalDateTime date;

    @Min(value = 0, message = "A duração não pode ser negativa")
    @Max(value = 1440, message = "A sessão não pode durar mais de 24 horas (1440 minutos)")
    private int durationMinutes;
    
    private boolean completed;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; 

    @ManyToOne
    @JoinColumn(name = "subject_id")
    @NotNull(message = "A matéria (disciplina) é obrigatória")
    private Subject subject;

    @ElementCollection(fetch = FetchType.EAGER) 
    @CollectionTable(name = "session_matters", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "matter")
    private List<String> matters = new ArrayList<>();

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "correct_questions")
    private Integer correctQuestions;
    
    public StudySession() {}

    public StudySession(
        Long id, 
        String title, 
        String description, 
        LocalDateTime date, 
        int durationMinutes, 
        boolean completed, 
        User user, 
        Subject subject, 
        List<String> matters) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.date = date;
            this.durationMinutes = durationMinutes;
            this.completed = completed;
            this.user = user;
            this.subject = subject;
            this.matters = matters;
    }

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

    public List<String> getMatters() { return matters; }
    public void setMatters(List<String> matters) { this.matters = matters; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    
    public Integer getCorrectQuestions() { return correctQuestions; }
    public void setCorrectQuestions(Integer correctQuestions) { this.correctQuestions = correctQuestions; }
}