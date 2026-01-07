package com.studyplanner.backend.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
// Importando todas as validações de uma vez para facilitar
import jakarta.validation.constraints.*;

@Entity
@Table(name = "goals")
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O título é obrigatório")
    @Size(min = 3, max = 50, message = "O título deve ter entre 3 e 50 caracteres")
    private String title; 
    
    @NotBlank(message = "O tipo da meta é obrigatório")
    private String goalType; 

    @NotNull(message = "A data de início é obrigatória")
    private LocalDate startDate;

    private LocalDate endDate; // Pode ser nulo (meta sem prazo definido)

    private boolean active;
    
    @NotNull(message = "A meta de horas é obrigatória")
    @Min(value = 1, message = "A meta deve ser de pelo menos 1 hora")
    @Max(value = 1000, message = "A meta não pode ultrapassar 1000 horas")
    private Double targetHours; 

    @Transient
    private double currentHours;

    @Transient
    private int progressPercentage;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // O Controller geralmente preenche isso, então sem @NotNull aqui para não quebrar o JSON de entrada

    @ManyToOne
    @JoinColumn(name = "subject_id")
    @NotNull(message = "Você deve selecionar uma matéria para a meta")
    private Subject subject;

    @Size(max = 255, message = "A descrição dos assuntos deve ter no máximo 255 caracteres")
    private String matters;

    // --- CONSTRUTORES ---
    public Goal() {}

    public Goal(Long id, String title, String goalType, LocalDate startDate, boolean active, User user) {
        this.id = id;
        this.title = title;
        this.goalType = goalType;
        this.startDate = startDate;
        this.active = active;
        this.user = user;
    }

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getGoalType() { return goalType; }
    public void setGoalType(String goalType) { this.goalType = goalType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public Double getTargetHours() { return targetHours; }
    public void setTargetHours(Double targetHours) { this.targetHours = targetHours; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public double getCurrentHours() { return currentHours; }
    public void setCurrentHours(double currentHours) { this.currentHours = currentHours; }

    public int getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public String getMatters() { return matters; }
    public void setMatters(String matters) { this.matters = matters; }
}