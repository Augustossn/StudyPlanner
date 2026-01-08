package com.studyplanner.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.studyplanner.backend.model.StudySession;
import com.studyplanner.backend.model.Subject;
import com.studyplanner.backend.model.User;

@DataJpaTest
class StudySessionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private StudySessionRepository repository;

    @Test
    void deveCalcularTotalDeMinutosCorretamente() {
        // 1. USUÁRIO
        User user = new User();
        user.setName("Teste");
        user.setEmail("teste@email.com");
        user.setPassword("123456");
        entityManager.persist(user);

        // 2. MATÉRIA (Agora com COR)
        Subject subject = new Subject();
        subject.setName("Java");
        subject.setColor("#FF0000"); // Obrigatório
        subject.setUser(user);
        entityManager.persist(subject);

        // 3. SESSÃO 1 (Agora com TÍTULO)
        StudySession s1 = new StudySession();
        s1.setTitle("Estudo 1"); // Obrigatório
        s1.setUser(user);
        s1.setSubject(subject);
        s1.setDurationMinutes(60); 
        s1.setDate(LocalDateTime.now());
        entityManager.persist(s1);

        // 4. SESSÃO 2
        StudySession s2 = new StudySession();
        s2.setTitle("Estudo 2"); // Obrigatório
        s2.setUser(user);
        s2.setSubject(subject);
        s2.setDurationMinutes(30);
        s2.setDate(LocalDateTime.now());
        entityManager.persist(s2);

        entityManager.flush();

        Integer total = repository.getTotalStudyMinutes(user.getId());

        assertThat(total).isEqualTo(90);
    }

    @Test
    void deveRetornarZeroSeNaoHouverSessoes() {
        User user = new User();
        user.setName("Preguiçoso");
        user.setEmail("vazio@email.com");
        user.setPassword("123456");
        entityManager.persist(user);
        entityManager.flush();

        Integer total = repository.getTotalStudyMinutes(user.getId());

        assertThat(total).isEqualTo(0);
    }

    @Test
    void deveFiltrarSessoesRecentes() {
        User user = new User();
        user.setName("User Filtro");
        user.setEmail("filtro@email.com");
        user.setPassword("123");
        entityManager.persist(user);

        Subject subject = new Subject();
        subject.setName("História");
        subject.setColor("#00FF00"); // Obrigatório
        subject.setUser(user);
        entityManager.persist(subject);

        // Sessão Antiga
        StudySession antiga = new StudySession();
        antiga.setTitle("Antiga"); // Obrigatório
        antiga.setUser(user);
        antiga.setSubject(subject);
        antiga.setDurationMinutes(60);
        antiga.setDate(LocalDateTime.now().minusDays(10));
        entityManager.persist(antiga);

        // Sessão Recente
        StudySession recente = new StudySession();
        recente.setTitle("Recente"); // Obrigatório
        recente.setUser(user);
        recente.setSubject(subject);
        recente.setDurationMinutes(60);
        recente.setDate(LocalDateTime.now());
        entityManager.persist(recente);

        entityManager.flush();

        LocalDateTime seteDiasAtras = LocalDateTime.now().minusDays(7);
        List<StudySession> resultado = repository.findRecentSessions(user.getId(), seteDiasAtras);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getTitle()).isEqualTo("Recente");
    }
}