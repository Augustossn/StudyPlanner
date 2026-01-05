package com.studyplanner.backend.model;

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
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String color;

    // Lista de assuntos DISPONÍVEIS para esta matéria
    @ElementCollection(fetch = FetchType.EAGER) // Adicionado EAGER para evitar erro no Dashboard
    @CollectionTable(name = "subject_subtopics", joinColumns = @JoinColumn(name = "subject_id"))
    @Column(name = "name")
    private List<String> subSubjects = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // --- CONSTRUTORES ---
    public Subject() {}

    public Subject(Long id, String name, String color, User user, List<String> subSubjects) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.user = user;
        this.subSubjects = subSubjects;
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

    public List<String> getSubSubjects() { return subSubjects; }
    public void setSubSubjects(List<String> subSubjects) { this.subSubjects = subSubjects; }
}