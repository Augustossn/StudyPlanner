package com.studyplanner.backend.repository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;

@DataJpaTest
@ActiveProfiles("test")
class SubjectRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SubjectRepository subjectRepository;

    @Test
    void deveListarApenasMateriasDoUsuarioEspecifico() {
        // 1. Criar e persistir Usuários
        User user1 = new User();
        user1.setName("João");
        user1.setEmail("joao@email.com");
        user1.setPassword("123456");
        entityManager.persist(user1);

        User user2 = new User();
        user2.setName("Maria");
        user2.setEmail("maria@email.com");
        user2.setPassword("123456");
        entityManager.persist(user2);

        // 2. Criar Matéria para User 1 (AGORA COM COR!)
        Subject subject1 = new Subject();
        subject1.setName("Matemática");
        subject1.setColor("#FF0000"); // <--- CORREÇÃO: Campo obrigatório
        subject1.setUser(user1);
        entityManager.persist(subject1);

        // 3. Criar Matéria para User 2 (AGORA COM COR!)
        Subject subject2 = new Subject();
        subject2.setName("História");
        subject2.setColor("#00FF00"); // <--- CORREÇÃO: Campo obrigatório
        subject2.setUser(user2);
        entityManager.persist(subject2);

        // Executa a busca
        List<Subject> resultado = subjectRepository.findByUserId(user1.getId());

        // Validações
        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getName()).isEqualTo("Matemática");
    }
}