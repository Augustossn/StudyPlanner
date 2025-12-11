package com.studyplanner.backend.model;

import jakarta.persistence.*; // Se der erro, mude para javax.persistence.*
import java.time.LocalDate;

@Entity
@Table(name = "goals")
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mudei de 'description' para 'title' para o Controller funcionar
    private String title; 
    
    private String goalType; 
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active;
    
    // Adicionei este campo pois seu Controller tentou usar .setTargetHours()
    private Double targetHours; 

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

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

    // --- GETTERS E SETTERS MANUAIS ---
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
}