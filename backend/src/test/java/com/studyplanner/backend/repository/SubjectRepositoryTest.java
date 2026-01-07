package com.studyplanner.backend.repository;

import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class SubjectRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SubjectRepository repository;

    @Test
    void deveListarApenasMateriasDoUsuarioEspecifico() {
        // 1. CENÁRIO
        // Cria Usuário 1 (Dono das matérias)
        User user1 = new User();
        user1.setName("User 1");
        user1.setEmail("u1@teste.com");
        user1.setPassword("123");
        entityManager.persist(user1);

        // Cria Usuário 2 (Intruso)
        User user2 = new User();
        user2.setName("User 2");
        user2.setEmail("u2@teste.com");
        user2.setPassword("123");
        entityManager.persist(user2);

        // Matéria do User 1
        Subject sub1 = new Subject();
        sub1.setName("Matemática");
        sub1.setUser(user1);
        entityManager.persist(sub1);

        // Matéria do User 1
        Subject sub2 = new Subject();
        sub2.setName("História");
        sub2.setUser(user1);
        entityManager.persist(sub2);

        // Matéria do User 2 (Não deve aparecer na busca)
        Subject sub3 = new Subject();
        sub3.setName("Física");
        sub3.setUser(user2);
        entityManager.persist(sub3);

        entityManager.flush();

        // 2. AÇÃO
        List<Subject> resultado = repository.findByUserId(user1.getId());

        // 3. VERIFICAÇÃO
        assertThat(resultado).hasSize(2); // Deve achar 2 matérias
        assertThat(resultado).extracting(Subject::getName)
                .containsExactlyInAnyOrder("Matemática", "História"); // Verifica os nomes
        
        // Garante que Fisica não veio
        assertThat(resultado).extracting(Subject::getName)
                .doesNotContain("Física");
    }
}