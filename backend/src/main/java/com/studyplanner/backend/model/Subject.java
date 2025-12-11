package com.studyplanner.backend.model;

import jakarta.persistence.*; 
// SE DER ERRO NA LINHA ACIMA (vermelho), troque 'jakarta' por 'javax'

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String color;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // --- CONSTRUTORES ---
    public Subject() {}

    public Subject(Long id, String name, String color, User user) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.user = user;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}