package com.studyplanner.backend.repository;

import com.studyplanner.backend.model.Goal;
import com.studyplanner.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class GoalRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private GoalRepository repository;

    @Test
    void deveRetornarApenasMetasAtivasDoUsuario() {
        // 1. CENÁRIO
        User user = new User();
        user.setName("Estudante");
        user.setEmail("estuda@teste.com");
        user.setPassword("123");
        entityManager.persist(user);

        // Meta Ativa (Deve vir)
        Goal metaAtiva = new Goal();
        metaAtiva.setTitle("Aprender Spring");
        metaAtiva.setActive(true); // <--- ATIVA
        metaAtiva.setUser(user);
        entityManager.persist(metaAtiva);

        // Meta Inativa / Arquivada (NÃO deve vir)
        Goal metaInativa = new Goal();
        metaInativa.setTitle("Aprender Cobol");
        metaInativa.setActive(false); // <--- INATIVA
        metaInativa.setUser(user);
        entityManager.persist(metaInativa);

        entityManager.flush();

        // 2. AÇÃO
        List<Goal> resultado = repository.findByUser_IdAndActiveTrue(user.getId());

        // 3. VERIFICAÇÃO
        assertThat(resultado).hasSize(1); // Só 1 meta
        assertThat(resultado.get(0).getTitle()).isEqualTo("Aprender Spring");
        assertThat(resultado.get(0).isActive()).isTrue();
    }

    @Test
    void naoDeveRetornarMetasDeOutrosUsuarios() {
        // Cenário: User 1 tem meta ativa, User 2 tem meta ativa
        User user1 = new User(); user1.setEmail("a@a.com"); user1.setPassword("1"); entityManager.persist(user1);
        User user2 = new User(); user2.setEmail("b@b.com"); user2.setPassword("1"); entityManager.persist(user2);

        Goal g1 = new Goal(); g1.setUser(user1); g1.setActive(true); entityManager.persist(g1);
        Goal g2 = new Goal(); g2.setUser(user2); g2.setActive(true); entityManager.persist(g2);
        
        entityManager.flush();

        // Ação: Busca pelo User 1
        List<Goal> resultado = repository.findByUser_IdAndActiveTrue(user1.getId());

        // Verificação: Só deve vir a meta do User 1
        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getUser().getId()).isEqualTo(user1.getId());
    }
}