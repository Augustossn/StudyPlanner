package com.studyplanner.backend.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome da matéria é obrigatório")
    @Size(min = 2, max = 50, message = "O nome deve ter entre 2 e 50 caracteres")
    private String name;

    @NotBlank(message = "A cor é obrigatória")
    private String color;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "subject_subtopics", joinColumns = @JoinColumn(name = "subject_id"))
    @Column(name = "name")
    private List<String> matters = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; 
    
    @OneToMany(mappedBy = "subject")
    @JsonIgnore 
    private List<StudySession> studySessions;

    @OneToMany(mappedBy = "subject")
    @JsonIgnore 
    private List<Goal> goals;

    public Subject() {}

    public Subject(Long id, String name, String color, User user, List<String> matters) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.user = user;
        this.matters = matters;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<String> getMatters() { return matters; }
    public void setMatters(List<String> matters) { this.matters = matters; }

    public List<StudySession> getStudySessions() { return studySessions; }
    public void setStudySessions(List<StudySession> studySessions) { this.studySessions = studySessions; }

    public List<Goal> getGoals() { return goals; }
    public void setGoals(List<Goal> goals) { this.goals = goals; }
}