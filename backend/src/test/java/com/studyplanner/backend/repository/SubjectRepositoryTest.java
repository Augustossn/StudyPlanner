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

        Subject subject1 = new Subject();
        subject1.setName("Matemática");
        subject1.setColor("#FF0000"); 
        subject1.setUser(user1);
        entityManager.persist(subject1);

        Subject subject2 = new Subject();
        subject2.setName("História");
        subject2.setColor("#00FF00"); 
        subject2.setUser(user2);
        entityManager.persist(subject2);

        List<Subject> resultado = subjectRepository.findByUserId(user1.getId());

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getName()).isEqualTo("Matemática");
    }
}