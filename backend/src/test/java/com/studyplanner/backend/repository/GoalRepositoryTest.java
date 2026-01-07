package com.studyplanner.backend.repository;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;

@DataJpaTest
@ActiveProfiles("test")
class GoalRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private GoalRepository goalRepository;

    @Test
    void deveRetornarApenasMetasAtivasDoUsuario() {
        // Cenário
        User user = new User();
        user.setName("Teste");
        user.setEmail("teste@email.com");
        user.setPassword("123");
        entityManager.persist(user);

        // PRECISAMOS DE UMA MATÉRIA VÁLIDA AGORA
        Subject subject = new Subject();
        subject.setName("Java");
        subject.setColor("#000000");
        subject.setUser(user);
        entityManager.persist(subject);

        // Meta Ativa (DADOS COMPLETOS)
        Goal goalAtiva = new Goal();
        goalAtiva.setTitle("Estudar JPA");
        goalAtiva.setActive(true);
        goalAtiva.setUser(user);
        
        // --- CORREÇÕES ABAIXO ---
        goalAtiva.setGoalType("Semanal");
        goalAtiva.setTargetHours(10.0);
        goalAtiva.setStartDate(LocalDate.now());
        goalAtiva.setSubject(subject); 
        // ------------------------
        
        entityManager.persist(goalAtiva);

        // Meta Inativa (DADOS COMPLETOS)
        Goal goalInativa = new Goal();
        goalInativa.setTitle("Meta Antiga");
        goalInativa.setActive(false);
        goalInativa.setUser(user);
        
        // --- CORREÇÕES ---
        goalInativa.setGoalType("Mensal");
        goalInativa.setTargetHours(5.0);
        goalInativa.setStartDate(LocalDate.now().minusMonths(1));
        goalInativa.setSubject(subject);
        // -----------------
        
        entityManager.persist(goalInativa);

        // Ação
        List<Goal> result = goalRepository.findByUser_IdAndActiveTrue(user.getId());

        // Verificação
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Estudar JPA");
    }
}