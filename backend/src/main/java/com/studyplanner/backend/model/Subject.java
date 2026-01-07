package com.studyplanner.backend.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore; // <--- NÃO ESQUEÇA DESTE IMPORT

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String color;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "subject_subtopics", joinColumns = @JoinColumn(name = "subject_id"))
    @Column(name = "name")
    private List<String> matters = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // --- ADICIONADO PARA CORRIGIR O LOOP E PERMITIR CASCADE FUTURO ---
    
    @OneToMany(mappedBy = "subject")
    @JsonIgnore // <--- Essencial para evitar o erro 500 (StackOverflow)
    private List<StudySession> studySessions;

    @OneToMany(mappedBy = "subject")
    @JsonIgnore // <--- Essencial para evitar o erro 500
    private List<Goal> goals;

    // -----------------------------------------------------------------

    // --- CONSTRUTORES ---
    public Subject() {}

    public Subject(Long id, String name, String color, User user, List<String> matters) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.user = user;
        this.matters = matters;
    }

    // --- GETTERS E SETTERS ---
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

    // Getters e Setters das novas listas (Opcional, mas bom ter)
    public List<StudySession> getStudySessions() { return studySessions; }
    public void setStudySessions(List<StudySession> studySessions) { this.studySessions = studySessions; }

    public List<Goal> getGoals() { return goals; }
    public void setGoals(List<Goal> goals) { this.goals = goals; }
}